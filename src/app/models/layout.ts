export class Layout {
    constructor(public toolbar: Options,
                public widget: Options) {
    }
}
export class Options {
    constructor(x_pos: number,
                y_pos: number,
                width: number,
                height: number,
                opac: number,
                border: boolean,
                b_width: number,
                b_color: string,
                vis: boolean
                ) {}
}
