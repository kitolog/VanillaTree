describe('FirstLoad', function () {

    it('Checks needed objects', function () {
        expect(VanillaTree).toBeDefined();
        expect(TreeModel).toBeDefined();
        expect(StorageService).toBeDefined();
        expect(HtmlHelper).toBeDefined();
    });

    it('Checks VanillaTree init', function () {
        VanillaTree.init();
        expect(VanillaTree['treeModel']).toBeDefined();
    });
});