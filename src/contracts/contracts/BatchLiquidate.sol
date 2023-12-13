// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {
    IMarket,
    Token18,
    UFixed6Lib,
    Fixed6,
    Fixed6Lib,
    UFixed18
} from '@equilibria/perennial-v2/contracts/interfaces/IMarket.sol';
import { Ownable } from '@equilibria/root/attribute/Ownable.sol';

interface IPythOracle {
    function commit(
        uint256 index,
        uint256 version,
        bytes memory data
    ) external payable;
}

contract BatchLiquidate is Ownable {
    Fixed6 private constant WITHDRAW_ALL = Fixed6.wrap(type(int256).min);
    bytes private constant OTHER_REASON = hex'01';
    bytes private constant NO_REASON = hex'00';

    Token18 immutable DSU;

    struct LiqRes {
        address user;
        bool canLiq; // TODO reason can just be 0x if no error
        bytes reason;
    }

    constructor(Token18 DSU_, address owner_) {
        DSU = DSU_;
        __UOwnable__initialize();
        updatePendingOwner(owner_);
    }

    /// @notice Tries to liquidate a list of accounts for a market after committing optional VAA data
    /// @param market Market to liqidate
    /// @param accounts List of accounts to try and liquidate
    /// @param commit Optional Pyth VAA to commit before liquidating
    /// @return res Result of liqidation (success or error) of each account in `accounts`
    /// @return commitRevertReason error bytes of commit
    ///         (0x00 = success or no commit reqested, 0x11 = unknown error in committing, else 4-byte error hash)
    function tryLiquidate(
        IMarket market,
        address[] calldata accounts,
        bytes calldata commit
    )
        public
        payable
        returns (LiqRes[] memory res, bytes memory commitRevertReason)
    {
        // try to commit VAA
        commitRevertReason = _tryCommitPrice(commit);

        res = new LiqRes[](accounts.length);
        for (uint i = 0; i < accounts.length; ++i) {
            // current account context
            address currUser = accounts[i];
            LiqRes memory currRes = LiqRes({
                user: currUser,
                canLiq: false,
                reason: NO_REASON
            });

            try market.update(currUser, UFixed6Lib.ZERO, UFixed6Lib.ZERO, UFixed6Lib.ZERO, Fixed6Lib.ZERO, true) {
                currRes.canLiq = true;
            } catch (bytes memory reason) {
                currRes.reason = reason.length > 1 ? reason : OTHER_REASON;
            }

            res[i] = currRes;
        }
    }

    function pullCollateral(IMarket market) external onlyOwner {
        UFixed18 dsuBalanceBefore = DSU.balanceOf(address(this));

        market.update(address(this), UFixed6Lib.ZERO, UFixed6Lib.ZERO, UFixed6Lib.ZERO, WITHDRAW_ALL, false);

        DSU.push(msg.sender, DSU.balanceOf(address(this)).sub(dsuBalanceBefore));

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
