// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@perennial/core/contracts/interfaces/IMarket.sol";
import "@perennial/extensions/contracts/interfaces/IMultiInvoker.sol";
import { IManager } from "@perennial/order/contracts/interfaces/IManager.sol";
import "@equilibria/root/token/types/Token18.sol";
import "@equilibria/root/attribute/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BatchKeeper is Ownable {
    /// @dev The market update collateral magic value for signaling a full withdrawal
    Fixed6 public constant WITHDRAW_ALL = Fixed6.wrap(type(int256).min);

    /// @dev The market update position magic value for signaling closing the position fully
    UFixed6 public constant CLOSE_POSITION = UFixed6.wrap(type(uint256).max - 1);

    /// @dev The MultiInvoker contract
    IMultiInvoker public immutable invoker;

    /// @dev The manager contract
    IManager public immutable manager;

    /// @dev Struct representing the result of a liquidation attempt.
    struct LiquidationResult {
        address account;
        UFixed6 reward;
        Result result;
    }

    /// @dev Struct representing the result of an order execution attempt.
    struct ExecutionResult {
        address source;
        address account;
        uint256 nonce;
        Result result;
    }

    /// @dev Struct representing the common result of an action.
    struct Result {
        bool success;
        bytes reason;
    }

    /// @dev Modifier to return any remaining Ether to the caller
    modifier returnEther() {
        _;

        Address.sendValue(payable(msg.sender), address(this).balance);
    }

    /// @notice Constructs a new BatchKeeper contract
    /// @param invoker_ The address of the MultiInvoker contract to use
    /// @param manager_ The address of the Manager contract to use
    constructor(IMultiInvoker invoker_, IManager manager_) {
        __Ownable__initialize();
        invoker = invoker_;
        manager = manager_;
    }

    /// @dev Allow the contract to receive Ether
    receive() external payable {}

    /// @notice Attempts to liquidate positions for multiple accounts in a market.
    /// @param market The market contract to perform the liquidation on.
    /// @param accounts An array of accounts to attempt liquidation on
    /// @param commitment Price update commitment to execute before liquidation
    /// @return results An array of `LiqRes` structs containing the liquidation results for each account
    function tryLiquidate(
        IMarket market,
        address[] memory accounts,
        IMultiInvoker.Invocation[] memory commitment
    ) external payable returnEther returns (LiquidationResult[] memory results) {
        invoker.invoke{value: msg.value}(commitment);

        UFixed6 liquidationFee = market.riskParameter().liquidationFee;
        results = new LiquidationResult[](accounts.length);
        for (uint256 i; i < accounts.length; i++) {
            results[i].account = accounts[i];

            try market.update(accounts[i], CLOSE_POSITION, CLOSE_POSITION, CLOSE_POSITION, Fixed6Lib.ZERO, true) {
                results[i].result.success = true;
                results[i].reward = liquidationFee;
            } catch (bytes memory reason) {
                results[i].result.reason = reason;
            }
        }
    }

    /// @notice Attempts to execute orders for multiple accounts in a market using the manager contract
    /// @param market The market contract to perform order execution for
    /// @param sources The source of the orders (multiinvoker or manager)
    /// @param accounts An array of accounts to attempt order execution for
    /// @param nonces An array of nonces (multiinvoker) or order IDs (manager) to attempt order execution for
    /// @param commitment Price update commitment to execute before execution
    /// @return results An array of `ExecutionResult` structs containing the execution results for each account
    /// @return reward The total reward earned by the keeper
    function tryExecute(
        IMarket market,
        address[] calldata sources,
        address[] calldata accounts,
        uint256[] calldata nonces,
        IMultiInvoker.Invocation[] memory commitment
    ) external payable returnEther returns (ExecutionResult[] memory results, UFixed18 reward) {
        invoker.invoke{value: msg.value}(commitment);

        UFixed18 balanceBefore = market.token().balanceOf();

        IMultiInvoker.Invocation[] memory invocations = new IMultiInvoker.Invocation[](1);
        invocations[0].action = IMultiInvoker.PerennialAction.EXEC_ORDER;

        results = new ExecutionResult[](accounts.length);
        for (uint256 i; i < accounts.length; i++) {
            results[i].source = sources[i];
            results[i].account = accounts[i];
            results[i].nonce = nonces[i];

            if (sources[i] == address(manager)) {
                try manager.executeOrder(market, accounts[i], nonces[i]) {
                    results[i].result.success = true;
                } catch (bytes memory reason) {
                        results[i].result.reason = reason;
                }
            } else {
                invocations[0].args = abi.encode(accounts[i], market, nonces[i]);
                try invoker.invoke(invocations) {
                    results[i].result.success = true;
                } catch (bytes memory reason) {
                    results[i].result.reason = reason;
                }
            }
        }

        reward = market.token().balanceOf().sub(balanceBefore);
    }

    /// @notice Withdraws all collateral from the specified markets
    /// @param markets An array of markets to withdraw collateral from
    function withdraw(IMarket[] memory markets) external onlyOwner {
        for (uint256 i = 0; i < markets.length; ++i) {
            markets[i].update(address(this), UFixed6Lib.ZERO, UFixed6Lib.ZERO, UFixed6Lib.ZERO, WITHDRAW_ALL, false);
            markets[i].claimFee(address(this));
        }
    }

    /// @notice Claims the full balance of `token`
    /// @param token The token to claim
    function claim(Token18 token) external onlyOwner {
        token.push(msg.sender);
    }
}
