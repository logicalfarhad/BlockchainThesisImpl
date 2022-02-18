const gentree = require("merkle-tree-gen");

class Merkeltree {
  constructor() {
    this.args = {
      array: [],
      hashalgo: "sha256",
    };
  }
  generate(payload, callback) {
    this.args.array.push(payload["DS18B20-1"].Temperature);
    this.args.array.push(payload["DS18B20-2"].Temperature);
    this.args.array.push(payload.Time);
    gentree.fromArray(this.args, (err, tree) => {
      if (!err) {
        callback(tree.root);
      }
    });
  }
}
module.exports = Merkeltree;
