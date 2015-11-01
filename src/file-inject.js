import {Readable} from 'stream';

/**
 * simplified readable stream combiner
 */
class ConcatReadable extends Readable {
    constructor (streams) {
        super();

        this.streams_ = streams || [];
        if (this.streams_.length) {
            this._next();
        }
    }

    _read (size) {
        if (this.current_) {
            var chunk = this.current_.read(size) || '';
            this.push(chunk);
        } else {
            this.push(null);
        }
    }

    _next () {
        var previous = this.current_,
            listeners = {
                readable: this.read.bind(this, 0),
                end: this._next.bind(this),
                error: this.emit.bind(this)
            },
            events = ['readable', 'end', 'error'];

        if (previous) {
            events.forEach(function (ev) {
                previous.removeListener(ev, listeners[ev]);
            });
        }

        if (this.streams_.length) {
            var shifted = this.streams_.shift();

            events.forEach(function (ev) {
                shifted.on(ev, listeners[ev]);
            });

            this.current_ = shifted;
        } else {
            this.current_ = null;
        }
    }
}

export default {

    injectCode (code) {
        var codes = typeof code === 'function' ? `(${code.toString()})();` : code.toString();
        var readable = new Readable();

        readable._read = function () {
            this.push(codes);
            this.push(null);
        };

        return readable;
    },

    /**
     * TODO
     */
    injectRequire () {},

    /**
     * TODO
     */
    inject () {
        return {
            chain (fn) {
                return new ConcatReadable(fn());
            }
        };
    }
};





