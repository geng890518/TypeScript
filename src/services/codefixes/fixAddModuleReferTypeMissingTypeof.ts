/* @internal */
namespace ts.codefix {
    const fixIdAddMissingTypeof = "fixAddModuleReferTypeMissingTypeof";
    const fixId = fixIdAddMissingTypeof;
    const errorCodes = [Diagnostics.Module_0_does_not_refer_to_a_type_but_is_used_as_a_type_here.code];
    registerCodeFix({
        errorCodes,
        getCodeActions: context => {
            const { sourceFile, span } = context;
            const typeContainer = getImportTypeNode(sourceFile, span.start);
            if (!typeContainer) return undefined;

            const changes = textChanges.ChangeTracker.with(context, t => doChange(t, sourceFile, typeContainer));
            return [createCodeFixAction(fixId, changes, Diagnostics.Add_missing_typeof, fixId, Diagnostics.Add_missing_typeof)];
        },
        fixIds: [fixId],
        getAllCodeActions: context => codeFixAll(context, errorCodes, (changes, diag) =>
            doChange(changes, context.sourceFile, getImportTypeNode(diag.file, diag.start!))),
    });

    function getImportTypeNode(sourceFile: SourceFile, pos: number): ImportTypeNode | undefined {
        const token = getTokenAtPosition(sourceFile, pos, /*includeJsDocComment*/ false);
        Debug.assert(token.kind === SyntaxKind.ImportKeyword);
        Debug.assert(token.parent.kind === SyntaxKind.ImportType);
        return <ImportTypeNode>token.parent;
    }

    function doChange(changes: textChanges.ChangeTracker, sourceFile: SourceFile, typeContainer: ImportTypeNode) {
        const newTypeNode = updateImportTypeNode(typeContainer, typeContainer.argument, typeContainer.qualifier, typeContainer.typeArguments, /* isTypeOf */ true);
        changes.replaceNode(sourceFile, typeContainer, newTypeNode);
    }
}
