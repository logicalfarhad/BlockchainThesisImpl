const gentree = require("merkle-tree-gen");

class Merkeltree {
  constructor() {
    this.args = {
      array: [],
      hashalgo: "sha256",
    };
  }
  generate(payload, callback) {
    this.args.array = payload;
    gentree.fromArray(this.args, (err, tree) => {
      if (!err) {
        callback(tree.root);
      }
    });
  }
}
module.exports = Merkeltree;
