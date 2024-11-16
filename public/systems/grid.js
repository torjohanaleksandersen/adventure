



export class Grid {
    constructor () {
        this.chunks = new Map();
    }

    setChunk(x, z) {
        if (this.chunks.has(this.getKey(x, z))) return;
        this.chunks.set(this.getKey(x, z), new Map());
    }

    deleteChunk(x, z) {
        if (!this.chunks.has(this.getKey(x, z))) return;
        this.chunks.delete(this.getKey(x, z));
    }

    getKey(x, z) {
        return `${x},${z}`;
    }

    isSpace(chunkInfo = {x, z, size}, x, z, xlen = 1, zlen = 1) {
        if (!this.chunks.has(this.getKey(chunkInfo.x, chunkInfo.z))) return false; //if no chunk

        const chunk = this.chunks.get(this.getKey(chunkInfo.x, chunkInfo.z));

        for (let i = - xlen / 2 + 0.5; i < xlen / 2 - 0.5; i ++) {
            for (let j = - zlen / 2 + 0.5; j < zlen / 2 + 0.5; j ++) {
                if (chunk.get(this.getKey(x + i, z + j)) == 1) {
                    return false;
                }
            }
        }

        return true;
    }


    registerNewObject(chunkInfo = {x, z}, x, z, xlen = 1, zlen = 1) {
        const chunk = this.chunks.get(this.getKey(chunkInfo.x, chunkInfo.z));

        for (let i = - xlen / 2 + 0.5; i < xlen / 2 - 0.5; i ++) {
            for (let j = - zlen / 2 + 0.5; j < zlen / 2 + 0.5; j ++) {
                chunk.set(this.getKey(x + i, z + j), 1);
            }
        }
    }
}