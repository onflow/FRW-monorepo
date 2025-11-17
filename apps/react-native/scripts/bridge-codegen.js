#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  input: '../../packages/types/src/Bridge.ts',
  output: {
    swift: 'ios/FRW/Foundation/Bridge/BridgeModels.swift',
    kotlin:
      'android/app/src/main/java/com/flowfoundation/wallet/reactnative/bridge/BridgeModels.kt',
  },
};

// Type mapping for different languages
const TYPE_MAPPING = {
  swift: {
    string: 'String',
    boolean: 'Bool',
    number: 'Int',
    'string[]': '[String]',
  },
  kotlin: {
    string: 'String',
    boolean: 'Boolean',
    number: 'Int',
    'string[]': 'List<String>',
  },
};

/**
 * Parse export type statements to find re-exported interfaces
 */
function parseExportTypeStatements(content, basePath) {
  const reexportedInterfaces = [];

  // Match export type statements like: export type { TokenModel } from './TokenModel';
  const exportTypeRegex = /export\s+type\s*\{\s*(\w+)\s*\}\s+from\s+['"]([^'"]+)['"]/g;
  let match;

  while ((match = exportTypeRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const importPath = match[2];

    // Resolve the full path
    const fullPath = path.resolve(path.dirname(basePath), importPath + '.ts');

    if (fs.existsSync(fullPath)) {
      const importedContent = fs.readFileSync(fullPath, 'utf8');

      // Find the interface in the imported file (handle multi-line interfaces and extends)
      const interfaceRegex = new RegExp(
        `export\\s+interface\\s+${interfaceName}\\s+extends\\s+([\\w\\s,]+)\\s*\\{([\\s\\S]*?)\\}`,
        'g'
      );
      const extendsMatch = interfaceRegex.exec(importedContent);

      let interfaceMatch = null;
      if (!extendsMatch) {
        // Try regular interface without extends
        const regularInterfaceRegex = new RegExp(
          `export\\s+interface\\s+${interfaceName}\\s*\\{([\\s\\S]*?)\\}`,
          'g'
        );
        interfaceMatch = regularInterfaceRegex.exec(importedContent);
      }

      if (extendsMatch) {
        // Handle interface with extends
        const extendedType = extendsMatch[1].trim();
        const ownProperties = parseInterfaceProperties(extendsMatch[2]);

        // Dynamically resolve base properties and collect referenced interfaces
        const collectedReferencedInterfaces = [];
        const baseProperties = resolveExtendedInterface(
          extendedType,
          fullPath,
          collectedReferencedInterfaces
        );
        const allProperties = [...baseProperties, ...ownProperties];

        reexportedInterfaces.push({
          name: interfaceName,
          properties: allProperties,
        });

        // Add any collected referenced interfaces
        reexportedInterfaces.push(...collectedReferencedInterfaces);
      } else if (interfaceMatch) {
        const properties = parseInterfaceProperties(interfaceMatch[1]);
        reexportedInterfaces.push({
          name: interfaceName,
          properties,
        });
      } else {
        // Check if it's an enum
        const enumRegex = new RegExp(
          `export\\s+enum\\s+${interfaceName}\\s*\\{([\\s\\S]*?)\\}`,
          'g'
        );
        const enumMatch = enumRegex.exec(importedContent);

        if (enumMatch) {
          const enumValues = parseEnumValues(enumMatch[1]);
          reexportedInterfaces.push({
            name: interfaceName,
            isEnum: true,
            enumValues,
          });
        }
      }
    }
  }

  return reexportedInterfaces;
}

/**
 * Parse TypeScript interface from file content
 */
function parseTypeScriptInterfaces(content, filePath) {
  const interfaces = [];

  // Match interface declarations
  const interfaceRegex = /export\s+interface\s+(\w+)\s*\{([^}]+)\}/g;
  let match;

  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const interfaceBody = match[2];

    const properties = parseInterfaceProperties(interfaceBody);

    interfaces.push({
      name: interfaceName,
      properties,
    });
  }

  // Also parse re-exported types
  const reexportedInterfaces = parseExportTypeStatements(content, filePath);
  interfaces.push(...reexportedInterfaces);

  return interfaces;
}

/**
 * Resolve external interface from node_modules and collect referenced interfaces
 */
function resolveExternalInterface(interfaceName, packagePath, collectedInterfaces = []) {
  try {
    let packageDir;
    let possibleFiles = [];

    // Check if it's a local workspace package first
    if (packagePath === '@onflow/frw-api') {
      packageDir = path.resolve('../../packages/api');
      possibleFiles = [
        path.join(packageDir, 'src/codegen/service.generated.ts'),
        path.join(packageDir, 'src/index.ts'),
        path.join(packageDir, 'index.ts'),
      ];
    } else {
      // Try to find the interface in node_modules
      packageDir = path.resolve('./node_modules', packagePath);
      possibleFiles = [
        path.join(packageDir, 'src/index.ts'),
        path.join(packageDir, 'src/codegen/service.generated.ts'),
        path.join(packageDir, 'index.ts'),
        path.join(packageDir, 'lib/index.ts'),
      ];
    }

    for (const filePath of possibleFiles) {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        const interfaceRegex = new RegExp(
          `export\\s+interface\\s+${interfaceName}\\s*\\{([\\s\\S]*?)\\}`,
          'g'
        );
        const match = interfaceRegex.exec(content);

        if (match) {
          const properties = parseInterfaceProperties(match[1]);

          // Recursively collect referenced interfaces from the same file
          const collectReferencedInterfaces = (props, content, processed = new Set()) => {
            props.forEach(prop => {
              // Check if property type references another interface (starts with uppercase)
              const typeMatch = prop.type
                .replace(/\?$/, '')
                .replace(/\[\]$/, '')
                .match(/^([A-Z]\w*)/);
              if (typeMatch) {
                const referencedType = typeMatch[1];

                // Avoid infinite recursion and duplicates
                const alreadyCollected = collectedInterfaces.some(
                  iface => iface.name === referencedType
                );
                const alreadyProcessed = processed.has(referencedType);

                if (
                  !alreadyCollected &&
                  !alreadyProcessed &&
                  referencedType !== interfaceName &&
                  !['String', 'Number', 'Boolean', 'Array', 'Object', 'Date'].includes(
                    referencedType
                  )
                ) {
                  processed.add(referencedType);

                  // Try to find the referenced interface in the same file
                  const referencedRegex = new RegExp(
                    `export\\s+interface\\s+${referencedType}\\s*\\{([\\s\\S]*?)\\}`,
                    'g'
                  );
                  const referencedMatch = referencedRegex.exec(content);

                  if (referencedMatch) {
                    console.log(`📦 Found referenced interface: ${referencedType}`);
                    const referencedProperties = parseInterfaceProperties(referencedMatch[1]);
                    collectedInterfaces.push({
                      name: referencedType,
                      properties: referencedProperties,
                    });

                    // Recursively process the referenced interface's properties
                    collectReferencedInterfaces(referencedProperties, content, processed);
                  }
                }
              }
            });
          };

          collectReferencedInterfaces(properties, content);

          return properties;
        }
      }
    }
  } catch (error) {
    console.warn(
      `⚠️  Could not resolve external interface ${interfaceName} from ${packagePath}: ${error.message}`
    );
  }

  return [];
}

/**
 * Resolve extended interface properties dynamically
 */
function resolveExtendedInterface(
  extendedType,
  currentFilePath,
  collectedInterfaces = [],
  cache = new Set()
) {
  // Prevent infinite recursion
  if (cache.has(extendedType)) {
    return [];
  }
  cache.add(extendedType);

  // Try to find the extended interface in the same file first
  const currentFileContent = fs.readFileSync(currentFilePath, 'utf8');
  const localInterfaceRegex = new RegExp(
    `export\\s+interface\\s+${extendedType}\\s*\\{([\\s\\S]*?)\\}`,
    'g'
  );
  const localMatch = localInterfaceRegex.exec(currentFileContent);

  if (localMatch) {
    return parseInterfaceProperties(localMatch[1]);
  }

  // Check imports in the current file to find where the extended type comes from
  const importRegex = new RegExp(
    `import\\s+(?:type\\s+)?\\{[^}]*\\b${extendedType}\\b[^}]*\\}\\s+from\\s+['"]([^'"]+)['"]`,
    'g'
  );
  const importMatch = importRegex.exec(currentFileContent);

  if (importMatch) {
    const importPath = importMatch[1];

    // Handle external dependencies (node_modules)
    if (importPath.startsWith('@')) {
      return resolveExternalInterface(extendedType, importPath, collectedInterfaces);
    }

    const fullImportPath = path.resolve(path.dirname(currentFilePath), importPath + '.ts');

    if (fs.existsSync(fullImportPath)) {
      const importedContent = fs.readFileSync(fullImportPath, 'utf8');

      // Check for regular interface
      const importedInterfaceRegex = new RegExp(
        `export\\s+interface\\s+${extendedType}\\s*\\{([\\s\\S]*?)\\}`,
        'g'
      );
      const importedMatch = importedInterfaceRegex.exec(importedContent);

      if (importedMatch) {
        return parseInterfaceProperties(importedMatch[1]);
      }

      // Check for extended interface in imported file
      const importedExtendsRegex = new RegExp(
        `export\\s+interface\\s+${extendedType}\\s+extends\\s+([\\w\\s,]+)\\s*\\{([\\s\\S]*?)\\}`,
        'g'
      );
      const importedExtendsMatch = importedExtendsRegex.exec(importedContent);

      if (importedExtendsMatch) {
        const baseType = importedExtendsMatch[1].trim();
        const ownProps = parseInterfaceProperties(importedExtendsMatch[2]);
        const baseProps = resolveExtendedInterface(
          baseType,
          fullImportPath,
          collectedInterfaces,
          cache
        );
        return [...baseProps, ...ownProps];
      }
    }
  }

  // If we can't find it locally, return empty array (external dependency)
  return [];
}

/**
 * Parse enum values from enum body
 */
function parseEnumValues(body) {
  const values = [];

  // Match enum values like: Flow = 'flow',
  const enumValueRegex = /(\w+)\s*=\s*['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = enumValueRegex.exec(body)) !== null) {
    values.push({
      key: match[1],
      value: match[2],
    });
  }

  return values;
}

/**
 * Parse properties from interface body
 */
function parseInterfaceProperties(body) {
  const properties = [];

  // Match property declarations
  const propertyRegex = /(\w+)(\?)?:\s*([^;]+);/g;
  let match;

  while ((match = propertyRegex.exec(body)) !== null) {
    const propertyName = match[1];
    const isOptional = !!match[2];
    const propertyType = match[3].trim();

    properties.push({
      name: propertyName,
      type: propertyType,
      optional: isOptional,
    });
  }

  return properties;
}

/**
 * Extract enum values from union type
 */
function extractEnumValues(unionType) {
  return unionType
    .split('|')
    .map(type => type.trim().replace(/'/g, ''))
    .filter(type => type.length > 0);
}

/**
 * Map TypeScript type to target language type
 */
function mapType(tsType, targetLang, propertyName = '') {
  // Handle array types
  if (tsType.endsWith('[]')) {
    const baseType = tsType.slice(0, -2);
    const mappedBase = mapType(baseType, targetLang, propertyName);
    return targetLang === 'swift' ? `[${mappedBase}]` : `List<${mappedBase}>`;
  }

  // Handle union types with string literals - create enum
  if (tsType.includes('|') && tsType.includes("'")) {
    const enumValues = extractEnumValues(tsType);
    if (enumValues.length > 1) {
      // Create enum name from property name
      let baseName;
      if (propertyName === 'type' && tsType.includes('Flow') && tsType.includes('EVM')) {
        baseName = 'WalletType';
      } else if (propertyName === 'type' && tsType.includes('main') && tsType.includes('child')) {
        baseName = 'AccountType';
      } else if (propertyName === 'transactionType') {
        baseName = 'TransactionType';
      } else {
        baseName = propertyName.charAt(0).toUpperCase() + propertyName.slice(1) + 'Type';
      }
      const enumName = baseName;
      return enumName;
    }
  }

  // Handle regular union types - treat as string
  if (tsType.includes('|')) {
    return TYPE_MAPPING[targetLang]['string'];
  }

  // Handle literal types - treat as string
  if (tsType.includes("'")) {
    return TYPE_MAPPING[targetLang]['string'];
  }

  return TYPE_MAPPING[targetLang][tsType] || tsType;
}

/**
 * Generate Swift enum code
 */
function generateSwiftEnum(enumName, values) {
  let code = `    enum ${enumName}: String, Codable {\n`;
  values.forEach(value => {
    // Convert kebab-case to camelCase for Swift enum cases
    let swiftCase = value.replace(/-(\w)/g, (match, letter) => letter.toUpperCase());
    code += `        case ${swiftCase} = "${value}"\n`;
  });
  code += `    }\n\n`;
  return code;
}

/**
 * Generate Swift struct code
 */
function generateSwiftCode(interfaces) {
  let code = `//
//  BridgeModels.swift
//  FRW
//
//  Auto-generated from TypeScript bridge types
//  Do not edit manually
//

import Foundation

enum RNBridge {
`;

  // Collect all enums first
  const enums = new Map();

  interfaces.forEach(iface => {
    if (iface.properties) {
      iface.properties.forEach(prop => {
        if (prop.type.includes('|') && prop.type.includes("'")) {
          const enumValues = extractEnumValues(prop.type);
          if (enumValues.length > 1) {
            let enumName;
            if (prop.name === 'type' && prop.type.includes('Flow') && prop.type.includes('EVM')) {
              enumName = 'WalletType';
            } else if (
              prop.name === 'type' &&
              prop.type.includes('main') &&
              prop.type.includes('child')
            ) {
              enumName = 'AccountType';
            } else if (prop.name === 'transactionType') {
              enumName = 'TransactionType';
            } else {
              enumName = prop.name.charAt(0).toUpperCase() + prop.name.slice(1) + 'Type';
            }
            enums.set(enumName, enumValues);
          }
        }
      });
    }
  });

  // Generate enums
  enums.forEach((values, enumName) => {
    code += generateSwiftEnum(enumName, values);
  });

  // Add InitialRoute enum (special case with rawValue)
  code += `    enum InitialRoute: String, Codable {
        case getStarted = "GetStarted"
        case profileTypeSelection = "ProfileTypeSelection"
        case selectTokens = "SelectTokens"
        case sendTo = "SendTo"
        case sendTokens = "SendTokens"
        case home = "Home"
    }

`;

  // Generate structs and enums
  interfaces.forEach(iface => {
    if (iface.isEnum) {
      // Generate enum
      code += `    enum ${iface.name}: String, Codable {\n`;
      iface.enumValues.forEach(enumValue => {
        code += `        case ${enumValue.key.toLowerCase()} = "${enumValue.value}"\n`;
      });
      code += `    }\n\n`;
    } else {
      // Generate struct
      code += `    struct ${iface.name}: Codable {\n`;

      if (iface.properties) {
        iface.properties.forEach(prop => {
          const swiftType = mapType(prop.type, 'swift', prop.name);
          const optionalMarker = prop.optional ? '?' : '';
          code += `        let ${prop.name}: ${swiftType}${optionalMarker}\n`;
        });
      }

      code += `    }\n\n`;
    }
  });

  code += `}\n`;
  return code;
}

/**
 * Generate Kotlin enum code
 */
function generateKotlinEnum(enumName, values) {
  let code = `    enum class ${enumName} {\n`;
  values.forEach((value, index) => {
    // Convert kebab-case to UPPER_SNAKE_CASE for Kotlin enum constants
    const enumCase = value.toUpperCase().replace(/-/g, '_');
    const comma = index < values.length - 1 ? ',' : '';
    code += `        @SerializedName("${value}") ${enumCase}${comma}\n`;
  });
  code += `    }\n\n`;
  return code;
}

/**
 * Generate Kotlin data class code
 */
function generateKotlinCode(interfaces) {
  let code = `//
//  BridgeModels.kt
//  
//  Auto-generated from TypeScript bridge types
//  Do not edit manually
//

package com.flowfoundation.wallet.reactnative.bridge

import com.google.gson.annotations.SerializedName

class RNBridge {
`;

  // Collect all enums first
  const enums = new Map();

  interfaces.forEach(iface => {
    if (iface.properties) {
      iface.properties.forEach(prop => {
        if (prop.type.includes('|') && prop.type.includes("'")) {
          const enumValues = extractEnumValues(prop.type);
          if (enumValues.length > 1) {
            let enumName;
            if (prop.name === 'type' && prop.type.includes('Flow') && prop.type.includes('EVM')) {
              enumName = 'WalletType';
            } else if (
              prop.name === 'type' &&
              prop.type.includes('main') &&
              prop.type.includes('child')
            ) {
              enumName = 'AccountType';
            } else if (prop.name === 'transactionType') {
              enumName = 'TransactionType';
            } else {
              enumName = prop.name.charAt(0).toUpperCase() + prop.name.slice(1) + 'Type';
            }
            enums.set(enumName, enumValues);
          }
        }
      });
    }
  });

  // Generate enums
  enums.forEach((values, enumName) => {
    code += generateKotlinEnum(enumName, values);
  });

  // Add InitialRoute enum (special case with routeName parameter)
  code += `    enum class InitialRoute(val routeName: String) {
        GET_STARTED("GetStarted"),
        PROFILE_TYPE_SELECTION("ProfileTypeSelection"),
        SELECT_TOKENS("SelectTokens"),
        SEND_TO("SendTo"),
        SEND_TOKENS("SendTokens"),
        HOME("Home")
    }

`;

  // Generate data classes and enums
  interfaces.forEach(iface => {
    if (iface.isEnum) {
      // Generate enum
      code += `    enum class ${iface.name} {\n`;
      iface.enumValues.forEach((enumValue, index) => {
        const comma = index < iface.enumValues.length - 1 ? ',' : '';
        // Convert kebab-case to UPPER_SNAKE_CASE for Kotlin enum constants
        const kotlinEnumCase = enumValue.key.toUpperCase().replace(/-/g, '_');
        code += `        @SerializedName("${enumValue.value}") ${kotlinEnumCase}${comma}\n`;
      });
      code += `    }\n\n`;
    } else {
      // Generate data class
      code += `    data class ${iface.name}(\n`;

      if (iface.properties) {
        const properties = iface.properties.map(prop => {
          const kotlinType = mapType(prop.type, 'kotlin', prop.name);
          const nullableMarker = prop.optional ? '?' : '';
          return `        @SerializedName("${prop.name}")
        val ${prop.name}: ${kotlinType}${nullableMarker}`;
        });

        code += properties.join(',\n') + '\n';
      }

      code += `    )\n\n`;
    }
  });

  code += `}\n`;
  return code;
}

/**
 * Main codegen function
 */
function generateBridgeModels() {
  try {
    console.log('🚀 Starting bridge model code generation...');

    // Read TypeScript bridge types
    const inputPath = path.resolve(CONFIG.input);
    if (!fs.existsSync(inputPath)) {
      throw new Error(`Input file not found: ${inputPath}`);
    }

    const tsContent = fs.readFileSync(inputPath, 'utf8');
    console.log(`📖 Reading TypeScript interfaces from ${CONFIG.input}`);

    // Parse interfaces
    const interfaces = parseTypeScriptInterfaces(tsContent, inputPath);
    console.log(
      `✅ Parsed ${interfaces.length} interfaces:`,
      interfaces.map(i => i.name).join(', ')
    );

    // Generate Swift code
    const swiftCode = generateSwiftCode(interfaces);
    const swiftOutputPath = path.resolve(CONFIG.output.swift);

    // Ensure Swift output directory exists
    const swiftDir = path.dirname(swiftOutputPath);
    if (!fs.existsSync(swiftDir)) {
      fs.mkdirSync(swiftDir, { recursive: true });
    }

    fs.writeFileSync(swiftOutputPath, swiftCode);
    console.log(`🍎 Generated Swift models: ${CONFIG.output.swift}`);

    // Generate Kotlin code
    const kotlinCode = generateKotlinCode(interfaces);
    const kotlinOutputPath = path.resolve(CONFIG.output.kotlin);

    // Ensure Kotlin output directory exists
    const kotlinDir = path.dirname(kotlinOutputPath);
    if (!fs.existsSync(kotlinDir)) {
      fs.mkdirSync(kotlinDir, { recursive: true });
    }

    fs.writeFileSync(kotlinOutputPath, kotlinCode);
    console.log(`🤖 Generated Kotlin models: ${CONFIG.output.kotlin}`);

    console.log('✨ Code generation completed successfully!');
  } catch (error) {
    console.error('❌ Code generation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generateBridgeModels();
}

module.exports = { generateBridgeModels };
