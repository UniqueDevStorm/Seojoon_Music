import {Listener} from "discord-akairo";
import SystemClient from "../../client";

export default class extends Listener {
    constructor() {
        super('common__ready', {
            event: 'ready',
            emitter: 'client'
        })
    }

    exec(): any {
        console.log(`${this.client.user!.tag} on Ready`)
        ;(this.client as SystemClient).manager.init(this.client.user!.id)
    }
}