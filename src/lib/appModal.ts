import type { ModalStaticFunctions } from "antd/es/modal/confirm";
import type { HookAPI } from "antd/es/modal/useModal";

/** Gán từ <App> — dùng thay Modal.confirm static của antd. */
let api: HookAPI | null = null;

export function setModalApi(instance: HookAPI) {
  api = instance;
}

type ConfirmOptions = Parameters<ModalStaticFunctions["confirm"]>[0];

export const appModal = {
  confirm: (config: ConfirmOptions) => {
    if (!api) {
      console.warn("[appModal] Modal API chưa sẵn sàng");
      return { destroy: () => undefined, update: () => undefined };
    }
    return api.confirm(config);
  },
};
