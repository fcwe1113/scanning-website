export const getDefaultFontSize = () => {

    const element = document.createElement('div');
    element.style.width = '1rem';
    element.style.display = 'none';
    document.body.append(element);
    const widthMatch = window
        .getComputedStyle(element)
        .getPropertyValue('width')
        .match(/\d+/);
    element.remove();
    if (!widthMatch || widthMatch.length < 1) {
        return 1; // if the function ever return 1 we have bigger issues
    }

    const result = Number(widthMatch[0]);
    return !isNaN(result) ? result : 1;
};