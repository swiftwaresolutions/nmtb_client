export const focusInputElementWithIndex = (inputParamenter: number) => {
    const inputs = document.querySelectorAll('input');
    const activeElement = document.activeElement as HTMLInputElement;
    if (activeElement) {
        const index = Array.from(inputs).indexOf(activeElement);
        const wantToFocusElement = inputs[index + inputParamenter]
        if (wantToFocusElement) {
            wantToFocusElement.focus()
        }
    }
}
export const focusInputElementWithPreviousInput = (previousInput: HTMLInputElement, inputParamenter: number) => {
    setTimeout(() => {
        const inputs = document.querySelectorAll('input');
        if (previousInput) {
            const index = Array.from(inputs).indexOf(previousInput);
            const wantToFocusElement = inputs[index + inputParamenter]
            if (wantToFocusElement) {
                wantToFocusElement.focus()
            }
        }
    })
}

export const hanldeZeroNumberInput = (value: string) => {
    if (value.length > 1 && value[0] == "0") {
        value = value.slice(1, value.length)
    } else if (!value) {
        value = "0"
    } else {
        value = value
    }
    return value
}