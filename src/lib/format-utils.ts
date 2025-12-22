export const formatConfigToJS = (obj: any, indentLevel = 2) => {
    const json = JSON.stringify(obj, null, indentLevel)
    // 1. Remove quotes from keys
    let js = json.replace(/"([a-zA-Z0-9_]+)":/g, '$1:')
    // 2. Convert double quotes to single quotes for values, avoiding escaped quotes issues
    js = js.replace(/: "([^"]*)"/g, ": '$1'" + (indentLevel === 2 ? '' : '\\n'))
    return js
}
