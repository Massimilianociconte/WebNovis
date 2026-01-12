/**
 * WebNovis Build Script
 * =======================
 * Sophisticated minification for JavaScript and CSS files.
 * Uses Terser for JS and CleanCSS for CSS.
 * 
 * Usage: npm run build
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const CleanCSS = require('clean-css');

// Configuration
const config = {
    js: {
        input: ['js/main.js', 'js/chat.js'],
        outputDir: 'js',
        suffix: '.min.js',
        terserOptions: {
            compress: {
                drop_console: true,      // Remove all console.* statements
                drop_debugger: true,     // Remove debugger statements
                dead_code: true,         // Remove unreachable code
                unused: true,            // Remove unused variables/functions
                passes: 2,               // Multiple passes for better compression
                pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
                global_defs: {
                    DEBUG: false
                }
            },
            mangle: {
                toplevel: false,         // Don't mangle top-level names (safer for globals)
                properties: false        // Don't mangle properties
            },
            format: {
                comments: false,         // Remove all comments
                ascii_only: true,        // Escape non-ASCII characters
                beautify: false,         // No beautification
                semicolons: true         // Use semicolons
            },
            sourceMap: false             // No source maps for production
        }
    },
    css: {
        input: ['css/style.css', 'css/portfolio-premium.css', 'css/social-feed-modern.css', 'css/weby-chat.css'],
        outputDir: 'css',
        suffix: '.min.css',
        cleanCSSOptions: {
            level: {
                1: {
                    all: true,
                    removeEmpty: true,
                    removeWhitespace: true
                },
                2: {
                    mergeAdjacentRules: true,
                    mergeIntoShorthands: true,
                    mergeMedia: true,
                    mergeNonAdjacentRules: true,
                    mergeSemantically: true,
                    overrideProperties: true,
                    removeEmpty: true,
                    removeDuplicateFontRules: true,
                    removeDuplicateMediaBlocks: true,
                    removeDuplicateRules: true,
                    removeUnusedAtRules: false,  // Keep all @keyframes etc.
                    restructureRules: true
                }
            },
            format: false,   // No formatting, full minification
            compatibility: {
                colors: {
                    hexAlpha: true
                },
                properties: {
                    merging: true
                }
            }
        }
    }
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(icon, message, color = colors.reset) {
    console.log(`${color}${icon} ${message}${colors.reset}`);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function calculateSavings(original, minified) {
    const saved = original - minified;
    const percent = ((saved / original) * 100).toFixed(1);
    return { saved, percent };
}

async function minifyJS(inputPath) {
    try {
        const fileName = path.basename(inputPath, '.js');
        const outputPath = path.join(config.js.outputDir, fileName + config.js.suffix);

        // Read source file
        const code = fs.readFileSync(inputPath, 'utf8');
        const originalSize = Buffer.byteLength(code, 'utf8');

        // Minify with Terser
        const result = await minify(code, config.js.terserOptions);

        if (result.error) {
            throw result.error;
        }

        // Write minified file
        fs.writeFileSync(outputPath, result.code, 'utf8');
        const minifiedSize = Buffer.byteLength(result.code, 'utf8');

        const { saved, percent } = calculateSavings(originalSize, minifiedSize);

        log('✓', `${inputPath} → ${outputPath}`, colors.green);
        log('  ', `${formatBytes(originalSize)} → ${formatBytes(minifiedSize)} (${colors.yellow}-${percent}%${colors.reset}, saved ${formatBytes(saved)})`, colors.cyan);

        return { success: true, originalSize, minifiedSize };
    } catch (error) {
        log('✗', `Error minifying ${inputPath}: ${error.message}`, colors.red);
        return { success: false, error };
    }
}

function minifyCSS(inputPath) {
    try {
        const fileName = path.basename(inputPath, '.css');
        const outputPath = path.join(config.css.outputDir, fileName + config.css.suffix);

        // Read source file
        const code = fs.readFileSync(inputPath, 'utf8');
        const originalSize = Buffer.byteLength(code, 'utf8');

        // Minify with CleanCSS
        const result = new CleanCSS(config.css.cleanCSSOptions).minify(code);

        if (result.errors && result.errors.length > 0) {
            throw new Error(result.errors.join(', '));
        }

        // Write minified file
        fs.writeFileSync(outputPath, result.styles, 'utf8');
        const minifiedSize = Buffer.byteLength(result.styles, 'utf8');

        const { saved, percent } = calculateSavings(originalSize, minifiedSize);

        log('✓', `${inputPath} → ${outputPath}`, colors.green);
        log('  ', `${formatBytes(originalSize)} → ${formatBytes(minifiedSize)} (${colors.yellow}-${percent}%${colors.reset}, saved ${formatBytes(saved)})`, colors.cyan);

        if (result.warnings && result.warnings.length > 0) {
            result.warnings.forEach(warning => {
                log('⚠', warning, colors.yellow);
            });
        }

        return { success: true, originalSize, minifiedSize };
    } catch (error) {
        log('✗', `Error minifying ${inputPath}: ${error.message}`, colors.red);
        return { success: false, error };
    }
}

async function build() {
    console.log('\n' + '═'.repeat(50));
    log('🚀', 'WebNovis Build Script v1.0', colors.blue);
    console.log('═'.repeat(50) + '\n');

    let totalOriginal = 0;
    let totalMinified = 0;
    let successCount = 0;
    let errorCount = 0;

    // Process JavaScript files
    log('📦', 'Minifying JavaScript files...', colors.blue);
    console.log('─'.repeat(40));

    for (const file of config.js.input) {
        if (fs.existsSync(file)) {
            const result = await minifyJS(file);
            if (result.success) {
                totalOriginal += result.originalSize;
                totalMinified += result.minifiedSize;
                successCount++;
            } else {
                errorCount++;
            }
        } else {
            log('⚠', `File not found: ${file}`, colors.yellow);
        }
    }

    console.log('');

    // Process CSS files
    log('🎨', 'Minifying CSS files...', colors.blue);
    console.log('─'.repeat(40));

    for (const file of config.css.input) {
        if (fs.existsSync(file)) {
            const result = minifyCSS(file);
            if (result.success) {
                totalOriginal += result.originalSize;
                totalMinified += result.minifiedSize;
                successCount++;
            } else {
                errorCount++;
            }
        } else {
            log('⚠', `File not found: ${file}`, colors.yellow);
        }
    }

    // Summary
    console.log('\n' + '═'.repeat(50));
    log('📊', 'Build Summary', colors.blue);
    console.log('═'.repeat(50));

    const { saved, percent } = calculateSavings(totalOriginal, totalMinified);

    console.log(`
  Files processed: ${successCount}
  Errors: ${errorCount}
  
  Total original:  ${formatBytes(totalOriginal)}
  Total minified:  ${formatBytes(totalMinified)}
  Total saved:     ${formatBytes(saved)} (${percent}%)
`);

    if (errorCount === 0) {
        log('✅', 'Build completed successfully!', colors.green);
    } else {
        log('⚠️', `Build completed with ${errorCount} error(s)`, colors.yellow);
    }

    console.log('');
}

// Run build
build().catch(console.error);
