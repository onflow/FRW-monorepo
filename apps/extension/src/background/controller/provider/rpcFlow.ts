import { ethErrors } from 'eth-rpc-errors';

import { permissionService } from '@/core/service';
import { underline2Camelcase } from '@/core/utils';
import { eventBus } from '@/extension-shared/messaging';
import { EVENTS } from '@/shared/constant';
import type { FlowContext, ProviderRequest } from '@/shared/types/provider-types';
import { consoleLog } from '@/shared/utils';

import notificationService from '../notification';
import Wallet from '../wallet';
import providerController from './controller';
import PromiseFlow from '../../utils/promiseFlow';

const isSignApproval = (type: string) => {
  const SIGN_APPROVALS = ['SignText', 'SignTypedData', 'SignTx', 'EthConfirm'];
  return SIGN_APPROVALS.includes(type);
};

const flow = new PromiseFlow();
const flowContext = flow
  .use(async (ctx, next) => {
    // check method
    const {
      data: { method },
    } = ctx.request;
    consoleLog('flow - use #1', method);

    ctx.mapMethod = underline2Camelcase(method);
    if (!providerController[ctx.mapMethod]) {
      // TODO: make rpc whitelist
      try {
        const { result } = await providerController.ethRpc(ctx.request.data);
        return result;
      } catch (error) {
        // Catch any error and throw the custom error
        throw ethErrors.rpc.methodNotFound({
          message: `method [${ctx.request.data.method}] doesn't have a corresponding handler, ${error}`,
          data: ctx.request.data,
        });
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    const {
      request: {
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    consoleLog('flow - use #2 - check connect', mapMethod, origin, name, icon);

    // Special case: Always show EthConnect for beezie.io when requesting accounts
    const isBeezieRequest = origin === 'https://beezie.io' && mapMethod === 'ethRequestAccounts';

    // check connect
    // TODO: create a whitelist and list of safe methods to remove the need for Reflect.getMetadata
    if (
      mapMethod !== 'ethAccounts' &&
      mapMethod !== 'walletRequestPermissions' &&
      mapMethod !== 'walletRevokePermissions' &&
      mapMethod !== 'walletSwitchEthereumChain' &&
      mapMethod !== 'walletWatchAsset' &&
      mapMethod !== 'walletConnect' &&
      mapMethod !== 'walletDisconnect' &&
      mapMethod !== 'ethChainId' &&
      !Reflect.getMetadata('SAFE', providerController, mapMethod)
    ) {
      // Always show EthConnect for beezie.io eth_requestAccounts, or if no permission/wallet locked
      if (
        isBeezieRequest ||
        !permissionService.hasPermission(origin) ||
        !(await Wallet.isUnlocked())
      ) {
        ctx.request.requestedApproval = true;
        const { defaultChain } = await notificationService.requestApproval(
          {
            params: { origin, name, icon },
            approvalComponent: 'EthConnect',
          },
          { height: 599 }
        );
        permissionService.addConnectedSite(origin, name, icon, defaultChain);
      }
    }

    return next();
  })
  .use(async (ctx, next) => {
    // check need approval
    const {
      request: {
        data: { params, method },
        session: { origin, name, icon },
      },
      mapMethod,
    } = ctx;
    consoleLog('flow - use #3 - check approval', params, mapMethod, origin, name, icon);

    const [{ height = 599 } = {}] =
      Reflect.getMetadata('APPROVAL', providerController, mapMethod) || [];
    if (mapMethod === 'ethSendTransaction' || mapMethod === 'personalSign') {
      ctx.request.requestedApproval = true;

      // Check if message is too long and show special popup
      const MAX_DATA_LENGTH = 30000;
      let isMessageTooLong = false;
      let rawMessage = '';

      if (params && params[0]) {
        if (typeof params[0] === 'string' && params[0].length > MAX_DATA_LENGTH) {
          isMessageTooLong = true;
          rawMessage = params[0];
        } else if (
          typeof params[0] === 'object' &&
          params[0].data &&
          typeof params[0].data === 'string' &&
          params[0].data.length > MAX_DATA_LENGTH
        ) {
          isMessageTooLong = true;
          rawMessage = params[0].data;
        }
      }

      if (isMessageTooLong) {
        const rawMessageLength = rawMessage.length;
        const truncatedRawMessage = rawMessage.substring(0, MAX_DATA_LENGTH);
        ctx.approvalRes = await notificationService.requestApproval(
          {
            approvalComponent: 'EthMessageTooLong',
            params: {
              method,
              data: params,
              session: { origin, name, icon },
              rawMessage: truncatedRawMessage,
              rawMessageLength: rawMessageLength,
            },
            origin,
          },
          { height }
        );
        // The approval will be rejected by the EthMessageTooLong component when user closes it
        // No need to process further since message cannot be signed
        return;
      }

      ctx.approvalRes = await notificationService.requestApproval(
        {
          approvalComponent: 'EthConfirm',
          params: {
            method,
            data: params,
            session: { origin, name, icon },
          },
          origin,
        },
        { height }
      );
      if (isSignApproval('EthConfirm')) {
        permissionService.updateConnectSite(origin, { isSigned: true }, true);
      } else {
        permissionService.touchConnectedSite(origin);
      }
    }

    return next();
  })
  .use(async (ctx) => {
    const { approvalRes, mapMethod, request } = ctx;
    consoleLog('flow - use #4 - process request', mapMethod, request);

    // process request
    const [approvalType] = Reflect.getMetadata('APPROVAL', providerController, mapMethod) || [];
    const { uiRequestComponent, ...rest } = approvalRes || {};
    const {
      session: { origin },
    } = request;
    const requestDefer = Promise.resolve(
      providerController[mapMethod]({
        ...request,
        approvalRes,
      })
    );

    requestDefer
      .then((result) => {
        consoleLog('flow - process result', mapMethod, result);
        if (isSignApproval(approvalType)) {
          eventBus.emit(EVENTS.broadcastToUI, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: true,
              data: result,
            },
          });
        }
        return result;
      })
      .catch((e) => {
        consoleLog('flow - process error', mapMethod, e);

        if (isSignApproval(approvalType)) {
          eventBus.emit(EVENTS.broadcastToUI, {
            method: EVENTS.SIGN_FINISHED,
            params: {
              success: false,
              errorMsg: JSON.stringify(e),
            },
          });
        }
      });
    async function requestApprovalLoop({ uiRequestComponent, ...rest }) {
      ctx.request.requestedApproval = true;
      const res = await notificationService.requestApproval({
        approvalComponent: uiRequestComponent,
        params: rest,
        origin,
        approvalType,
      });
      if (res.uiRequestComponent) {
        return await requestApprovalLoop(res);
      } else {
        return res;
      }
    }
    if (uiRequestComponent) {
      ctx.request.requestedApproval = true;
      return await requestApprovalLoop({ uiRequestComponent, ...rest });
    }

    return requestDefer;
  })
  .callback();

export default (request: ProviderRequest) => {
  const ctx: FlowContext = { request: { ...request, requestedApproval: false } };
  return flowContext(ctx).finally(() => {
    if (ctx.request.requestedApproval) {
      flow.requestedApproval = false;
      // only unlock notification if current flow is an approval flow
      notificationService.unLock();
    }
  });
};
