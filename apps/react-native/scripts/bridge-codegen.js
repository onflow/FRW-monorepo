#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  input: '../../packages/types/src/Bridge.ts',
  output: {
    swift: 'ios/FRW/Foundation/Bridge/BridgeModels.swift',
    kotlin: 'android/app/src/main/java/com/flowfoundation/wallet/bridge/BridgeModels.kt',
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
 * Parse TypeScript interface from file content
 */
function parseTypeScriptInterfaces(content) {
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

  return interfaces;
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
      const baseName =
        propertyName === 'type'
          ? 'AccountType'
          : propertyName.charAt(0).toUpperCase() + propertyName.slice(1) + 'Type';
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
    code += `        case ${value} = "${value}"\n`;
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
    iface.properties.forEach(prop => {
      if (prop.type.includes('|') && prop.type.includes("'")) {
        const enumValues = extractEnumValues(prop.type);
        if (enumValues.length > 1) {
          const enumName =
            prop.name === 'type'
              ? 'AccountType'
              : prop.name.charAt(0).toUpperCase() + prop.name.slice(1) + 'Type';
          enums.set(enumName, enumValues);
        }
      }
    });
  });

  // Generate enums
  enums.forEach((values, enumName) => {
    code += generateSwiftEnum(enumName, values);
  });

  // Generate structs
  interfaces.forEach(iface => {
    code += `    struct ${iface.name}: Codable {\n`;

    iface.properties.forEach(prop => {
      const swiftType = mapType(prop.type, 'swift', prop.name);
      const optionalMarker = prop.optional ? '?' : '';
      code += `        let ${prop.name}: ${swiftType}${optionalMarker}\n`;
    });

    code += `    }\n\n`;
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
    const enumCase = value.toUpperCase();
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

package com.flowfoundation.wallet.bridge

import com.google.gson.annotations.SerializedName

class RNBridge {
`;

  // Collect all enums first
  const enums = new Map();

  interfaces.forEach(iface => {
    iface.properties.forEach(prop => {
      if (prop.type.includes('|') && prop.type.includes("'")) {
        const enumValues = extractEnumValues(prop.type);
        if (enumValues.length > 1) {
          const enumName =
            prop.name === 'type'
              ? 'AccountType'
              : prop.name.charAt(0).toUpperCase() + prop.name.slice(1) + 'Type';
          enums.set(enumName, enumValues);
        }
      }
    });
  });

  // Generate enums
  enums.forEach((values, enumName) => {
    code += generateKotlinEnum(enumName, values);
  });

  // Generate data classes
  interfaces.forEach(iface => {
    code += `    data class ${iface.name}(\n`;

    const properties = iface.properties.map(prop => {
      const kotlinType = mapType(prop.type, 'kotlin', prop.name);
      const nullableMarker = prop.optional ? '?' : '';
      return `        @SerializedName("${prop.name}")
        val ${prop.name}: ${kotlinType}${nullableMarker}`;
    });

    code += properties.join(',\n') + '\n';
    code += `    )\n\n`;
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
    const interfaces = parseTypeScriptInterfaces(tsContent);
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
