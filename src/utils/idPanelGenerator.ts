export const getNewPanelId = () => {
    const id = crypto.randomUUID();
    console.debug('getNewPanelId', id);
    return id;
};
