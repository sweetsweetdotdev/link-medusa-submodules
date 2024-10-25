#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

// Array of directories to symlink files into
const targetDirs = ['admin', 'api', 'jobs', 'links', 'modules', 'scripts', 'subscribers', 'workflows'];

// Paths
const packagesDir = path.join(__dirname, 'packages');

// Function to create symlinks
const createSymlinks = () => {
    fs.readdir(packagesDir, (err, packages) => {
        if (err) throw err;

        packages.forEach(pkg => {
            targetDirs.forEach(targetDir => {
                const pkgTargetDir = path.join(packagesDir, pkg, targetDir);
                const destTargetDir = path.join(__dirname, 'src', targetDir, pkg);

                // Check if the package has the target directory
                if (fs.existsSync(pkgTargetDir)) {
                    // Ensure the destination directory exists
                    fs.ensureDirSync(destTargetDir);

                    // Get all files in the package's target directory
                    fs.readdir(pkgTargetDir, (err, files) => {
                        if (err) throw err;

                        files.forEach(file => {
                            const srcFile = path.join(pkgTargetDir, file);
                            const destFile = path.join(destTargetDir, file);

                            // Create symlink
                            fs.symlink(srcFile, destFile, 'file', err => {
                                if (err && err.code !== 'EEXIST') throw err;
                                console.log(`Symlinked ${srcFile} to ${destFile}`);
                            });
                        });
                    });
                }
            });
        });
    });
};

createSymlinks();