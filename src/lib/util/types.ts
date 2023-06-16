// https://github.com/microsoft/TypeScript/issues/36336#issuecomment-583179583 or https://github.com/microsoft/TypeScript/issues/46984#issuecomment-984151454
export type ADTEnum<K extends PropertyKey, T extends object> = {
    [P in keyof T]: ({ [Q in K]: P } & T[P]) extends infer U ? { [Q in keyof U]: U[Q] } : never
}[keyof T]