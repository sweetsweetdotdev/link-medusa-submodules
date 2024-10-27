#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

// Array of directories to symlink files into
const targetDirs = ['admin', 'api', 'jobs', 'links', 'modules', 'scripts', 'subscribers', 'workflows'];

// Paths
const rootDir = process.cwd();
const packagesDir = path.join(rootDir, 'packages');
const srcDir = path.join(rootDir, 'src');

// Function to create symlinks
const createSymlinks = () => {
    fs.readdir(packagesDir, (err, packages) => {
        if (err) {
            console.warn(`Failed to read packages directory at ${packagesDir}`);
            return;
        }

        packages.forEach(pkg => {
            targetDirs.forEach(targetDir => {
                const pkgTargetDir = path.join(packagesDir, pkg, targetDir);
                const destTargetDir = path.join(srcDir, targetDir);

                // Check if the package has the target directory
                if (fs.existsSync(pkgTargetDir)) {
                    // Ensure the destination directory exists
                    fs.ensureDirSync(destTargetDir);

                    // Get all files in the package's target directory
                    fs.readdir(pkgTargetDir, (err, files) => {
                        if (err) {
                            console.warn(`Failed to read directory at ${pkgTargetDir}`);
                            return;
                        }

                        files.forEach(file => {
                            const srcFile = path.join(pkgTargetDir, file);
                            const destFile = path.join(destTargetDir, file);

                            // Create symlink
                            fs.symlink(srcFile, destFile, 'file', err => {
                                if (err && err.code !== 'EEXIST') {
                                    console.warn(`Failed to create symlink from ${srcFile} to ${destFile}`);
                                    return;
                                }

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