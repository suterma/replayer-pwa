const consoleLog = console.log;
const consoleError = console.error;
const consoleWarn = console.warn;

const containerStyles = {
    position: 'fixed',
    overflow: 'scroll',
    width: '300px',
    height: '450px',
    display: 'none',
    bottom: '85px',
    zIndex: '100000',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    right: '20px',
    marginLeft: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '2px 4px 5px 3px rgba(224, 224, 224, 0.8)',
};

const floatButtonStyles = {
    opacity: '0.8',
    position: 'fixed',
    width: '70px',
    border: 'none',
    height: '35px',
    /* start hidden */
    display: 'none',
    bottom: '40px',
    zIndex: '100000',
    right: '15px',
    backgroundColor: '#d4ebf2',
    color: '#fff',
    borderRadius: '50px',
    textAlign: 'center',
    cursor: 'pointer',
};

const buttonDefaultOpacity = {
    opacity: 1,
};

const listItemStyles = {
    fontFamily: 'Arial',
    fontSize: '13px',
    paddingTop: '5px',
    paddingBottom: '5px',
    paddingLeft: '15px',
    paddingRight: '15px',
};

const clearBtnStyles = {
    cursor: 'pointer',
    float: 'right',
    paddingRight: '10px',
    paddingTop: '3px',
    opacity: '0.5',
    fontSize: '15px',
    backgroundColor: 'transparent',
    border: 'none',
};

const logoTextStyles = {
    fontFamily: 'Arial',
    fontSize: '16px',
    fontWeight: 'bold',
    paddingLeft: '15px',
    paddingTop: '3px',
    fontStyle: 'italic',
    color: '#525EF9',
};

const notificationBadgeStyles = {
    position: 'absolute',
    display: 'none',
    top: '-3px',
    right: '6px',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    backgroundColor: 'red',
};

const outfrontLogUl = document.createElement('UL'); // Memory leak alert
const notificationBadge = document.createElement('SPAN'); // Memory leak alert

const createButtonAndContainer = (): void => {
    try {
        // Create container start
        const container = document.createElement('DIV');
        container.id = 'outfront-container';
        const containerCss = containerStyles as CSSStyleDeclaration;
        for (const property in containerCss) {
            container.style[property] = containerCss[property];
        }
        // Create container end

        // Create clear console button start
        const clearBtn = document.createElement('BUTTON'); // button
        clearBtn.id = 'outfront-clear-btn';
        clearBtn.innerText = '⟲'; // 🗑️ ⟲ ⌫
        const clearBtnCss = clearBtnStyles as CSSStyleDeclaration;
        for (const property in clearBtnCss) {
            clearBtn.style[property] = clearBtnCss[property];
        }
        clearBtn.addEventListener(
            'click',
            () => (outfrontLogUl.innerHTML = ''),
        );
        container.appendChild(clearBtn);
        // Create clear console button end

        //Create logo text start
        const logo = document.createElement('DIV');
        logo.id = 'outfront-container';
        logo.innerText = '𝙊𝙪𝙩𝙁𝙧𝙤𝙣𝙩 𝙅𝙎';
        const logoTextCss = logoTextStyles as CSSStyleDeclaration;
        for (const property in logoTextCss) {
            logo.style[property] = logoTextCss[property];
        }
        container.appendChild(logo);
        // Create logo text end

        // hr start
        const hr = document.createElement('HR');
        hr.style.marginTop = '1px';
        hr.style.marginBottom = '0';
        hr.style.border = '0';
        hr.style.borderTop = '1px solid #eaeaea';
        container.appendChild(hr);
        // hr end

        //create ul start
        outfrontLogUl.id = 'outfront-log';
        outfrontLogUl.style.marginTop = '0px';
        container.appendChild(outfrontLogUl);
        //create ul end

        // Create float button start
        const toggleBtn = document.createElement('BUTTON');
        toggleBtn.id = 'outfront-float';
        toggleBtn.innerText = '🐞';
        const buttonCss = floatButtonStyles as CSSStyleDeclaration;
        for (const property in buttonCss) {
            toggleBtn.style[property] = buttonCss[property];
        }
        toggleBtn.addEventListener(
            'mouseenter',
            (): string =>
                (toggleBtn.style.opacity =
                    buttonDefaultOpacity.opacity.toString()),
        );
        toggleBtn.addEventListener(
            'mouseout',
            (): string =>
                (toggleBtn.style.opacity = (
                    container.style.display === 'none'
                        ? floatButtonStyles.opacity
                        : buttonDefaultOpacity.opacity
                ).toString()),
        );

        toggleBtn.addEventListener('click', (): void => {
            if (container.style.display === 'none') {
                container.style.display = 'block';
                toggleBtn.style.opacity =
                    buttonDefaultOpacity.opacity.toString();
                notificationBadge.style.display = 'none';
            } else {
                container.style.display = 'none';
                toggleBtn.style.opacity = floatButtonStyles.opacity.toString();
            }
        });
        // Create float button end

        // Create notification badge start
        // const notificationBadge = document.createElement('SPAN') // initialized in global scope
        notificationBadge.id = 'outfront-badge';
        // notificationBadge.innerText = 'b'
        const badgeCss = notificationBadgeStyles as CSSStyleDeclaration;
        for (const property in badgeCss) {
            notificationBadge.style[property] = badgeCss[property];
        }
        toggleBtn.append(notificationBadge);
        // Create notification badge start

        document.body.appendChild(container);
        document.body.appendChild(toggleBtn);
    } catch (error) {
        console.log(error);
    }
};

const toggleNotoficationBadge = (color: string): void => {
    // toggle notification badge only if container is closed
    const outFrontContainer = document.getElementById('outfront-container');
    if (outFrontContainer && outFrontContainer.style.display !== 'block') {
        notificationBadge.style.display = 'block';
        notificationBadge.style.backgroundColor = color;
    }
};

const appendToContainer = (msg: any, type: string) => {
    // Create li start
    const logLi = document.createElement('LI');
    logLi.id = 'outfront-log-li';
    const itemCss = listItemStyles as CSSStyleDeclaration;
    for (const property in itemCss) {
        logLi.style[property] = itemCss[property];
    }
    // Create li end

    if (type === logLevelLog) {
        logLi.style.color = 'black';
        logLi.style.backgroundColor = 'white';
        toggleNotoficationBadge('cyan');
    } else if (type === logLevelWarn) {
        logLi.style.color = 'orange';
        logLi.style.backgroundColor = '#fff3e7';
        toggleNotoficationBadge('orange');
        // logLi.style.borderTop = '0.2px solid orange'
        // logLi.style.borderBottom = '0.1px solid orange'
    } else if (type === logLevelError) {
        logLi.style.color = 'red';
        logLi.style.backgroundColor = '#ffeaea';
        toggleNotoficationBadge('red');
        // logLi.style.borderTop = '0.2px solid red'
        // logLi.style.borderBottom = '0.1px solid red'
    }
    const textNode = document.createTextNode(msg);
    logLi.appendChild(textNode);
    // const outfrontLogUl = document.getElementById('outfront-log')
    outfrontLogUl.style.listStyleType = 'none';
    outfrontLogUl.style.padding = '0';

    outfrontLogUl.appendChild(logLi);

    //Decide whether to show the float button
    if (getLogLevelOrder(type) >= getLogLevelOrder(outFrontFromLevel)) {
        const outFrontFloatBtn = document.getElementById('outfront-float');
        if (outFrontFloatBtn && outFrontFloatBtn.style.display !== 'block') {
            notificationBadge.style.display = 'block';
        }
    }
};

const getLogLevelOrder = (logLevel: string): number => {
    if (logLevel === logLevelLog) {
        return 0;
    }
    if (logLevel === logLevelWarn) {
        return 1;
    }

    if (logLevel === logLevelError) {
        return 2;
    }
    return 99;
};

console.log = (msg: any): void => {
    consoleLog(msg); // do the usual logging as well
    appendToContainer(msg, logLevelLog);
};

console.error = (msg: any): void => {
    consoleError(msg); // do the usual logging as well
    appendToContainer(msg, logLevelError);
};

console.warn = (msg: any): void => {
    consoleWarn(msg); // do the usual logging as well
    appendToContainer(msg, logLevelWarn);
};

window.onerror = (message, source, lineno, _colno, _error): void => {
    appendToContainer(
        `${message}::${source?.split('/')[3]}:${lineno}`,
        logLevelError,
    );
};

const outfront = (showFromLevel: string): void => {
    outFrontFromLevel = showFromLevel;
    createButtonAndContainer();
};

export const logLevelWarn = 'warn';
export const logLevelError = 'error';
export const logLevelLog = 'log';

/** The log level from which to show messages. 'log' by default. */
let outFrontFromLevel: string = logLevelLog;

// window.onload = () => outfront()

export default outfront;
