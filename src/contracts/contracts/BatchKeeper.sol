// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import '@equilibria/perennial-v2/contracts/interfaces/IMarket.sol';
import '@equilibria/perennial-v2-extensions/contracts/interfaces/IMultiInvoker.sol';
import '@equilibria/root/attribute/Ownable.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

interface IKeeperFactory {
    function commit(
        bytes32[] memory ids,
        uint256 version,
        bytes calldata data
    ) external payable;
}

contract BatchKeeper is Ownable {
    bytes public constant FAILURE = hex'01';
    bytes public constant NO_REASON = hex'00';
    Fixed6 public constant MARKETR_MAGIC_VALUE_WITHDRAW_ALL_COLLATERAL =
        Fixed6.wrap(type(int256).min);

    IMultiInvoker immutable invoker;

    constructor(IMultiInvoker invoker_) {
        invoker = invoker_;
        __Ownable__initialize();
    }

    /**
     * @dev Struct representing the result of a liquidation attempt.
     */
    struct LiqRes {
        address user;
        bool canLiq;
        bytes reason;
        UFixed6 reward;
    }

    /**
     * @dev Attempts to liquidate positions for multiple accounts in a market.
     * @param market The market contract to perform the liquidation on.
     * @param accounts An array of accounts to attempt liquidation on
     * @param commitment Price update commitment to execute before liquidation
     * @return res An array of `LiqRes` structs containing the liquidation results for each account
     */
    function tryLiquidate(
        IMarket market,
        address[] memory accounts,
        IMultiInvoker.Invocation[] memory commitment,
        uint256 commitmentValue
    ) external payable returns (LiqRes[] memory res) {
        invoker.invoke{value: commitmentValue}(commitment);

        res = new LiqRes[](accounts.length);
        for (uint i = 0; i < accounts.length; ++i) {
            // current account context
            address currUser = accounts[i];
            LiqRes memory currRes = LiqRes({
                user: currUser,
                canLiq: false,
                reason: NO_REASON,
                reward: UFixed6Lib.ZERO
            });

            try
                market.update(
                    currUser,
                    UFixed6Lib.ZERO,
                    UFixed6Lib.ZERO,
                    UFixed6Lib.ZERO,
                    Fixed6Lib.ZERO,
                    true
                )
            {
                currRes.canLiq = true;
                currRes.reward = market.locals(currUser).protectionAmount;
            } catch (bytes memory reason) {
                currRes.reason = reason.length > 1 ? reason : FAILURE;
            }

            res[i] = currRes;
        }
    }

    /**
     * @dev Struct representing the result of an order execution attempt
     */
    struct ExecRes {
        address user;
        uint256 nonce;
        bool canExec;
        bytes reason;
    }

    /**
     * @dev Attempts to execute orders for multiple accounts in a market
     * @param market The market contract to perform order execution for
     * @param accounts An array of accounts to attempt order execution for
     * @param nonces An array of nonces to attempt order execution for
     * @param commitment Price update commitment to execute before execution
     * @return res An array of `ExecRes` structs containing the execution results for each account
     */
    function tryExecute(
        IMarket market,
        address[] calldata accounts,
        uint256[] calldata nonces,
        IMultiInvoker.Invocation[] memory commitment,
        uint256 commitmentValue
    ) public payable returns (ExecRes[] memory res, UFixed18 reward) {
        // try commit VAA
        invoker.invoke{value: commitmentValue}(commitment);

        UFixed18 balanceBefore = market.token().balanceOf(address(this));

        IMultiInvoker.Invocation[]
            memory invocations = new IMultiInvoker.Invocation[](1);

        invocations[0] = IMultiInvoker.Invocation({
            action: IMultiInvoker.PerennialAction.EXEC_ORDER,
            args: hex'00'
        });

        res = new ExecRes[](accounts.length);
        for (uint256 i = 0; i < accounts.length; ++i) {
            address currUser = accounts[i];
            ExecRes memory currRes = ExecRes({
                user: currUser,
                nonce: nonces[i],
                canExec: false,
                reason: NO_REASON
            });

            invocations[0].args = abi.encode(currUser, market, nonces[i]);
            try invoker.invoke(invocations) {
                currRes.canExec = true;
            } catch (bytes memory reason) {
                currRes.reason = reason.length > 1 ? reason : FAILURE;
            }

            res[i] = currRes;
        }

        reward = UFixed18(market.token().balanceOf(address(this))).sub(
            balanceBefore
        );
    }

    /**
     * @dev Withdraws all collateral from the specified markets
     * @param markets An array of markets to withdraw collateral from
     */
    function marketWithdraw(IMarket[] memory markets) external onlyOwner {
        for (uint256 i = 0; i < markets.length; ++i) {
            markets[i].update(
                address(this),
                UFixed6Lib.ZERO,
                UFixed6Lib.ZERO,
                UFixed6Lib.ZERO,
                MARKETR_MAGIC_VALUE_WITHDRAW_ALL_COLLATERAL,
                false
            );
        }
    }

    /**
     * @dev Transfers the specified amount of the specified token to the specified address
     * @param token The token to transfer
     * @param to The address to transfer to
     * @param amount The amount to transfer
     */
    function transferToken(
        IERC20 token,
        address to,
        uint256 amount
    ) public onlyOwner {
        token.transfer(to, amount);
    }

    receive() external payable {}

    fallback() external payable {}
}
