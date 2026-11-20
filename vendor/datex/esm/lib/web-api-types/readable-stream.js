import { CoreLibTypeId } from "../../dif/core.js";
const readableStreamControllers = new WeakMap();
export const readableStreamTypeBinding = {
    coreLibTypeId: CoreLibTypeId.Receiver,
    jsClass: ReadableStream,
    bind(target) {
        const metadata = {};
        const readableStream = new ReadableStream({
            start(controller) {
                readableStreamControllers.set(target, controller);
            },
        });
        return {
            value: readableStream,
            metadata,
        };
    },
    handleAppend(target, value) {
        const originalTarget = this.difHandler.getOriginalValueFromProxy(target);
        const controller = readableStreamControllers.get(originalTarget);
        if (controller) {
            try {
                controller.enqueue(value);
            }
            catch (_e) {
                // TODO: what to do in this case? cleanup?
            }
        }
        else {
            throw new Error("ReadableStream controller is not available.");
        }
    },
};
