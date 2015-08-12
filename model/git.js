var _        = require('lodash'),
    execSync = require('child_process').execSync;

// TODO: get git command from shell
var gitExec = 'git';

function Git (path) {
  this.path = path;

  this.loadBranches();
}

Git.prototype.clear = function () {
  this.files = {
    staged  : [],
    unstaged: []
  };

  this.selected = {
    staged  : [],
    unstaged: []
  };

  this.symbols = {
    staged  : [],
    unstaged: []
  };
};

Git.prototype.setStatus = function (code, path) {
  if (code.charAt(0) !== '?' && code.charAt(0) !== ' ') {
    this.files.staged.push(path);
    this.selected.staged.push(false);
    this.symbols.staged.push(code.charAt(0));
  }

  if (code.charAt(1) !== ' ') {
    this.files.unstaged.push(path);
    this.selected.unstaged.push(false);
    this.symbols.unstaged.push(code.charAt(1));
  }
};

Git.prototype.parseStatus = function (stdout) {
  return stdout.split('\n')
    .reduce(function (result, row) {
      if (row !== '') {
        result.push({
          code: row.substr(0, 2),
          path: row.substr(3)
        });
      }

      return result;
    }, []);
};

Git.prototype.convertStatus = function (stdout) {
  var self   = this,
      status = this.parseStatus(stdout);

  _.each(status, function (item) {
    self.setStatus(item.code, item.path);
  });
};

Git.prototype.status = function () {
  var self = this;

  this.clear();

  var gitCommand = gitExec + ' status -su';

  var stdout = execSync(gitCommand);

  return self.convertStatus(stdout.toString());
};

Git.prototype.isSelected = function (type, index) {
  if (index !== undefined) {
    return this.selected[type][index];
  } else {
    return _.every(this.selected[type], function (selected) {
      return selected;
    });
  }
};

Git.prototype.select = function (type, index) {
  if (index !== undefined) {
    this.selected[type][index] = true;
  } else {
    for (var i = 0; i < this.selected[type].length; i++) {
      this.selected[type][i] = true;
    }
  }
};

Git.prototype.deselect = function (type, index) {
  if (index !== undefined) {
    this.selected[type][index] = false;
  } else {
    for (var i = 0; i < this.selected[type].length; i++) {
      this.selected[type][i] = false;
    }
  }
};

Git.prototype.getStagedFiles = function () {
  return this.files.staged;
};

Git.prototype.selectedFiles = function (type) {
  var selectedFiles = [];

  for (var i = 0; i < this.selected[type].length; i++) {
    if (this.selected[type][i] === true) {
      selectedFiles.push('"' + this.files[type][i] + '"');
    }
  }

  return selectedFiles.join(' ');
};

Git.prototype.commandWithFiles = function (command, type) {
  var files = this.selectedFiles(type);

  var gitCommand = gitExec + ' ' + command + ' ' + files;

  var stdout = execSync(gitCommand);

  return stdout.toString();
};

Git.prototype.add = function () {
  return this.commandWithFiles('add', 'unstaged');
};

Git.prototype.reset = function () {
  return this.commandWithFiles('reset --', 'staged');
};

Git.prototype.commit = function (message) {
  message.replace('"', '\\"');

  var gitCommand = gitExec + ' commit -m "' + message + '"';

  var stdout = execSync(gitCommand);

  return stdout.toString();
};

var isNotEmpty = function (value) {
  return !_.isEmpty(value);
};

var parseLogContent = function (logs, line) {
  if (line.slice(0, 6) === 'commit') {
    logs.push({
      id: line.slice(7)
    });
  } else if (line.slice(0, 6) === 'Author') {
    var emailIndex = line.indexOf('<');

    if (emailIndex > 0) {
      _.last(logs).author = {
        name : line.slice(8, emailIndex - 1),
        email: line.slice(emailIndex + 1, -1)
      };
    } else {
      _.last(logs).author = {
        name: line
      };
    }
  } else if (line.slice(0, 4) === 'Date') {
    _.last(logs).date = new Date(line.slice(5));
  } else {
    if (!_.last(logs).messages) {
      _.last(logs).messages = [_.trim(line)];
    } else {
      _.last(logs).messages.push(_.trim(line));
    }
  }

  return logs;
};

Git.prototype.log = function () {
  var gitCommand = gitExec + ' log';

  var stdout = execSync(gitCommand);

  return _(stdout.toString().split('\n'))
    .filter(isNotEmpty)
    .reduce(parseLogContent, []);
};

Git.prototype.resetCommit = function (commitId) {
  var gitCommand = gitExec + ' reset ' + commitId;

  var stdout = execSync(gitCommand);

  return stdout.toString();
};

Git.prototype.diff = function (type, index) {
  var gitCommand = gitExec + ' diff "' + this.files[type][index] + '"';

  var stdout = execSync(gitCommand);

  return stdout.toString();
};

Git.prototype.loadBranches = function () {
  var self = this;

  var gitCommand = gitExec + ' branch --list';

  var stdout = execSync(gitCommand);

  this.branches = _.trim(stdout.toString()).split('\n')
    .map(function (line, index) {
      if (line.charAt(0) === '*') {
        self.currentBranchIndex = index;
        return _.trim(line.slice(2));
      } else {
        return _.trim(line);
      }
    });

  return this.branches;
};

Git.prototype.getCurrentBranchName = function () {
  return this.branches[this.currentBranchIndex];
};

Git.prototype.checkout = function (branchIndex) {
  var gitCommand = gitExec + ' checkout ' + this.branches[branchIndex];

  var stdout = execSync(gitCommand, {stdio: [0, 'pipe', 'pipe']});

  this.currentBranchIndex = branchIndex;

  return this.currentBranchIndex;
};

Git.prototype.delBranch = function (branchIndex) {
  var gitCommand = gitExec + ' branch -d ' + this.branches[branchIndex];

  var stdout = execSync(gitCommand, {stdio: [0, 'pipe', 'pipe']});

  this.currentBranchIndex = branchIndex;

  return this.currentBranchIndex;
};

Git.prototype.addBranch = function (branchName) {
  var gitCommand = gitExec + ' branch ' + _.trim(branchName);

  var stdout = execSync(gitCommand, {stdio: [0, 'pipe', 'pipe']});

  return branchName;
};

module.exports = Git;
