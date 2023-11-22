// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Token18, UFixed18} from '@equilibria/perennial-v2/contracts/interfaces/IMarket.sol';

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

contract BatchKeeper {
    bytes public constant OTHER_REASON = hex'01';
    bytes public constant NO_REASON = hex'00';

    /// @dev Gets DSU balance before and after function call and pushes profits of function to receiver
    modifier PushProceeds(Token18 collatToken, address feeReceiver) {
        UFixed18 balanceBefore = collatToken.balanceOf(address(this)); // TODO: assume this is 0?
        _;
        UFixed18 profit = collatToken.balanceOf(address(this)).sub(
            balanceBefore
        );
        if (!profit.isZero()) {
            collatToken.push(feeReceiver, profit);
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
                // Catch named or unnamed error and return
                payable(msg.sender).transfer(msg.value);
                revertReason = reason.length > 1 ? reason : OTHER_REASON;
            }
        }
    }
}
