// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import './BatchKeeper.sol';

contract BatchExecute is BatchKeeper {
    IMultiInvoker immutable invoker;

    struct ExecRes {
        address user;
        uint256 nonce;
        bool canExec;
        bytes reason;
    }

    constructor(IMultiInvoker invoker_) {
        invoker = invoker_;
    }

    // cheaper to abi.encode on chain than pass
    function tryExecute(
        address market,
        address feeReceiver,
        Token18 collatToken,
        address[] calldata accounts,
        uint256[] calldata nonces,
        bytes calldata commit
    )
        public
        payable
        PushProceeds(collatToken, feeReceiver)
        returns (ExecRes[] memory res, bytes memory commitRevertReason)
    {
        // try commit VAA
        commitRevertReason = _tryCommitPrice(commit);

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
                currRes.reason = reason.length > 1 ? reason : OTHER_REASON;
            }

            res[i] = currRes;
        }
    }
}
