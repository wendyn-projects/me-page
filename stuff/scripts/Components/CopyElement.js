export class CopyElementMessages {
    constructor(success, failed)
    {
        this._current = CopyElementMessages.success;
        this[CopyElementMessages.success] = success;
        this[CopyElementMessages.failed] = failed;
    }

    static success = 'success';
    static failed = 'failed';
}

export class CopyElement {

    #duration;
    #msgs;
    #elem;
    #messageElem;
    #messageTextElem;

    constructor(element, duration, msgs) {

        this.#messageElem = document.createElement('div');
        this.#messageElem.classList.add('message');
        this.#messageElem.classList.add('hidden');

        const input = document.createElement('input');
        let text = element.dataset.copyText ?? element.textContent;
        input.value = text;
        input.readOnly = true;
        // TODO: better way to check for size
        input.style.width = text.length * .625 + 'em';
        this.#messageElem.appendChild(input);
        
        this.#messageTextElem = document.createElement('span');
        this.#messageTextElem.style.whiteSpace = 'nowrap';
        this.#messageTextElem.style.marginLeft = '.5em';

        this.#messageElem.append(this.#messageTextElem);

        this.duration = 0;
        this.#duration = duration;
        this.#elem = element;
        this.#msgs = msgs;

        element.appendChild(this.#messageElem);

        const ev = () => {
            this.duration = this.#duration;

            navigator.clipboard.writeText(text).then(() => {
                this.#messageTextElem.classList.remove('problem');
                this.#messageElem.classList.remove('hidden');
                this.#messageText = CopyElementMessages.success;
                
                setTimeout(
                    () => setTimeout(() => this.#messageElem.classList.add('hidden'), this.duration * 1000), 
                    this.duration * 1000
                );
            }, () => {
                this.#elem.removeEventListener('click', ev);
                this.#messageTextElem.classList.add('problem');
                this.#messageElem.classList.remove('hidden');
                this.#messageText = CopyElementMessages.failed;
                
                input.focus();
                input.select();
                input.addEventListener('focusout', () => {
                    this.#messageElem.classList.add('hidden');
                    this.#elem.addEventListener('click', ev);
                });
            });

        }
        this.#elem.addEventListener('click', ev);
    }

    #refreshLocation() {
        const rect = this.#elem.getBoundingClientRect();
        this.#messageElem.style.top = rect.bottom + 'px';
        this.#messageElem.style.left = `min(${rect.left}px, calc(100vw - ${this.#messageElem.offsetWidth + 1}px - 1em))`;
    }

    get #messageText() {
        this.#msgs[this.#msgs._current];
    }

    set #messageText(message) {
        this.#msgs._current = message;
        this.#messageTextElem.textContent = this.#msgs[message];
        this.#refreshLocation();
    }

    get duration() {
        return this.#duration;
    }

    set duration(duration) {
        this.#duration = duration;
        this.#messageElem.style.setProperty('--duration', duration + 's');
    }

    get msgs(){
        return this.#msgs;
    } 

    set msgs(msgs) {
        const current = this.#msgs._current;
        this.#msgs = msgs;
        this.#messageText = current;
    }

    static Initialize(duration, msgs) {
        const elements = document.getElementsByClassName("copy");
        for(let element of elements) {
            new CopyElement(element, duration ?? .375, msgs ?? new CopyElementMessages('copied ✅', 'copied ❌'));
        }
    }
}