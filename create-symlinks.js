#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

// Array of directories to copy files into
const targetDirs = ['admin', 'api', 'jobs', 'links', 'modules', 'scripts', 'subscribers', 'workflows'];

// Paths
const rootDir = process.cwd();
const packagesDir = path.join(rootDir, 'packages');
const srcDir = path.join(rootDir, 'src');

// Function to copy files
const copyFiles = () => {
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

                    // Recursively traverse directories and copy files
                    const traverseAndCopy = (currentDir, relativePath = '') => {
                        fs.readdir(currentDir, { withFileTypes: true }, (err, entries) => {
                            if (err) {
                                console.warn(`Failed to read directory at ${currentDir}`);
                                return;
                            }

                            entries.forEach(entry => {
                                const entryPath = path.join(currentDir, entry.name);
                                const relativeEntryPath = path.join(relativePath, entry.name);
                                const destPath = path.join(destTargetDir, relativeEntryPath);

                                if (entry.isDirectory()) {
                                    // Ensure the destination directory exists
                                    fs.ensureDirSync(destPath);
                                    // Recursively traverse the subdirectory
                                    traverseAndCopy(entryPath, relativeEntryPath);
                                } else if (entry.isFile()) {
                                    // Check file extension
                                    const ext = path.extname(entry.name);
                                    if (['.js', '.tsx', '.ts'].includes(ext)) {
                                        // Copy file and overwrite if it exists
                                        fs.copy(entryPath, destPath, { overwrite: true }, err => {
                                            if (err) {
                                                console.warn(`Failed to copy file from ${entryPath} to ${destPath}`);
                                                return;
                                            }

                                            console.log(`Copied ${entryPath} to ${destPath}`);
                                        });
                                    }
                                }
                            });
                        });
                    };

                    traverseAndCopy(pkgTargetDir);
                }
            });
        });
    });
};

copyFiles();