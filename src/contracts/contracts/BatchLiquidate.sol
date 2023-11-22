// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {IMarket, IPayoffProvider, Position, Local, OracleVersion, RiskParameter, UFixed6, Fixed6, Fixed6Lib, UFixed6Lib, UFixed18} from '@equilibria/perennial-v2/contracts/interfaces/IMarket.sol';
import { Token6 } from '@equilibria/root/token/types/Token6.sol';

interface IMultiInvoker {
    enum PerennialAction {
        NO_OP, // 0
        UPDATE_POSITION, // 1
        UPDATE_VAULT, // 2
        PLACE_ORDER, // 3
        CANCEL_ORDER, // 4
        EXEC_ORDER, // 5
        COMMIT_PRICE, // 6
        LIQUIDATE, // 7
        APPROVE, // 8
        CHARGE_FEE // 9
    }

    struct Invocation {
        PerennialAction action;
        bytes args;
    }

    function invoke(Invocation[] calldata invocations) external payable;
}

interface IPythOracle {
    function commit(
        uint256 index,
        uint256 version,
        bytes memory data
    ) external payable;
}

contract BatchLiquidate {
    bytes public constant OTHER_REASON = hex'01';
    bytes public constant NO_REASON = hex'00';
    IMultiInvoker immutable invoker;

    struct LiqRes {
        address user;
        bool canLiq; // TODO reason can just be 0x if no error
        bytes reason;
    }

    constructor(IMultiInvoker invoker_) {
        invoker = invoker_;
    }

    /// @dev Gets DSU balance before and after function call and pushes profits of function to receiver
    modifier PushProceeds(Token6 collatToken, address feeReceiver) {
        UFixed6 balanceBefore = collatToken.balanceOf(address(this)); // TODO: assume this is 0?
        _;
        UFixed6 profit = collatToken.balanceOf(address(this)).sub(
            balanceBefore
        );
        if (!profit.isZero()) {
            collatToken.push(feeReceiver, profit);
        }
    }

    /// @notice Tries to liquidate a list of accounts for a market after committing optional VAA data
    /// @param market Market to liqidate
    /// @param feeReceiver Address to receive DSU proceeds of liquidations\
    /// @param collatToken Collateral token of the market // TODO deal with this better, easier to pass it than affect deployed bytecode
    /// @param accounts List of accounts to try and liquidate
    /// @param commit Optional Pyth VAA to commit before liquidating
    /// @return res Result of liqidation (success or error) of each account in `accounts`
    /// @return commitRevertReason error bytes of commit
    ///         (0x00 = success or no commit reqested, 0x11 = unknown error in committing, else 4-byte error hash)
    function tryLiquidate(
        IMarket market,
        address feeReceiver,
        Token6 collatToken,
        address[] calldata accounts,
        bytes calldata commit
    )
        public
        payable
        PushProceeds(collatToken, feeReceiver)
        returns (LiqRes[] memory res, bytes memory commitRevertReason)
    {
        // try to commit VAA
        commitRevertReason = _tryCommitPrice(commit);

        IMultiInvoker.Invocation[]
            memory invocations = new IMultiInvoker.Invocation[](1);
        invocations[0] = IMultiInvoker.Invocation({
            action: IMultiInvoker.PerennialAction.LIQUIDATE,
            args: hex'00'
        });

        res = new LiqRes[](accounts.length);
        for (uint i = 0; i < accounts.length; ++i) {
            // current account context
            address currUser = accounts[i];
            LiqRes memory currRes = LiqRes({
                user: currUser,
                canLiq: false,
                reason: NO_REASON
            });

            invocations[0].args = abi.encode(market, currUser);
            try invoker.invoke(invocations) {
                currRes.canLiq = true;
            } catch (bytes memory reason) {
                currRes.reason = reason.length > 1 ? reason : OTHER_REASON;
            }

            res[i] = currRes;
        }
    }

    /// @notice Helper function to commit a price to an oracle
    /// @param args encoded args of price commit
    /// @return revertReason error bytes of commit
    ///         (0x00 = success or no commit reqested, 0x11 = unknown error in committing, else 4-byte error hash)
    function _tryCommitPrice(
        bytes calldata args
    ) internal returns (bytes memory revertReason) {
        if (2 > args.length) return NO_REASON;
        (
            address oracleProvider,
            uint256 value,
            uint256 index,
            uint256 version,
            bytes memory data,
            bool revertOnFailure
        ) = abi.decode(args, (address, uint256, uint256, uint256, bytes, bool));

        if (revertOnFailure) {
            IPythOracle(oracleProvider).commit{value: value}(
                index,
                version,
                data
            );
            revertReason = NO_REASON;
        } else {
            try
                IPythOracle(oracleProvider).commit{value: value}(
                    index,
                    version,
                    data
                )
            {
                revertReason = NO_REASON;
            } catch (bytes memory reason) {
                // Catch named or unnamed error
                revertReason = reason.length > 1 ? reason : OTHER_REASON;
            }
        }
    }
}
