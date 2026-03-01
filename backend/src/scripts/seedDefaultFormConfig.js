const mongoose = require('mongoose');
const FormConfig = require('../models/FormConfig');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/authentik');

async function seedDefaultFormConfig() {
  try {
    console.log('🌱 Seeding default form configuration...');

    // Check if global config already exists
    const existingConfig = await FormConfig.findOne({ isGlobal: true });
    
    if (existingConfig) {
      console.log('⚠️  Global form config already exists. Updating...');
      
      existingConfig.formName = 'QR Creation Form';
      existingConfig.description = 'Default form for creating QR codes with product information';
      existingConfig.customFields = [
        {
          fieldName: 'productName',
          fieldLabel: 'Product Name',
          fieldType: 'text',
          isMandatory: true,
          placeholder: 'e.g. Premium Widget',
          order: 1,
        },
        {
          fieldName: 'productImage',
          fieldLabel: 'Product Image',
          fieldType: 'image',
          isMandatory: false,
          order: 2,
        },
        {
          fieldName: 'sku',
          fieldLabel: 'SKU/Model Number',
          fieldType: 'text',
          isMandatory: false,
          placeholder: 'e.g. SKU-12345',
          order: 3,
        },
        {
          fieldName: 'batchNo',
          fieldLabel: 'Batch Number',
          fieldType: 'text',
          isMandatory: true,
          placeholder: 'e.g. BATCH-001',
          order: 4,
        },
        {
          fieldName: 'mrp',
          fieldLabel: 'MRP (Maximum Retail Price)',
          fieldType: 'number',
          isMandatory: false,
          placeholder: 'e.g. 999',
          order: 5,
        },
        {
          fieldName: 'manufacturedBy',
          fieldLabel: 'Manufactured By',
          fieldType: 'text',
          isMandatory: false,
          placeholder: 'Company name',
          order: 6,
        },
        {
          fieldName: 'marketedBy',
          fieldLabel: 'Marketed By',
          fieldType: 'text',
          isMandatory: false,
          placeholder: 'Company name',
          order: 7,
        },
        {
          fieldName: 'quantity',
          fieldLabel: 'Product Quantity',
          fieldType: 'number',
          isMandatory: true,
          placeholder: '0',
          order: 8,
        },
      ];
      
      existingConfig.variants = [
        {
          variantName: 'color',
          variantLabel: 'Color',
          inputType: 'color',
          order: 1,
        },
        {
          variantName: 'size',
          variantLabel: 'Size',
          inputType: 'text',
          order: 2,
        },
        {
          variantName: 'model',
          variantLabel: 'Model/Series',
          inputType: 'text',
          order: 3,
        },
      ];
      
      existingConfig.staticFields = {
        brand: { enabled: true, isMandatory: true }, // Brand dropdown
        mfdOn: { enabled: true, isMandatory: true },
        bestBefore: { enabled: true, isMandatory: true },
      };
      
      await existingConfig.save();
      console.log('✅ Updated existing global form configuration');
    } else {
      // Create new global config
      const defaultConfig = await FormConfig.create({
        isGlobal: true,
        formName: 'QR Creation Form',
        description: 'Default form for creating QR codes with product information',
        customFields: [
          {
            fieldName: 'productName',
            fieldLabel: 'Product Name',
            fieldType: 'text',
            isMandatory: true,
            placeholder: 'e.g. Premium Widget',
            order: 1,
          },
          {
            fieldName: 'productImage',
            fieldLabel: 'Product Image',
            fieldType: 'image',
            isMandatory: false,
            order: 2,
          },
          {
            fieldName: 'sku',
            fieldLabel: 'SKU/Model Number',
            fieldType: 'text',
            isMandatory: false,
            placeholder: 'e.g. SKU-12345',
            order: 3,
          },
          {
            fieldName: 'batchNo',
            fieldLabel: 'Batch Number',
            fieldType: 'text',
            isMandatory: true,
            placeholder: 'e.g. BATCH-001',
            order: 4,
          },
          {
            fieldName: 'mrp',
            fieldLabel: 'MRP (Maximum Retail Price)',
            fieldType: 'number',
            isMandatory: false,
            placeholder: 'e.g. 999',
            order: 5,
          },
          {
            fieldName: 'manufacturedBy',
            fieldLabel: 'Manufactured By',
            fieldType: 'text',
            isMandatory: false,
            placeholder: 'Company name',
            order: 6,
          },
          {
            fieldName: 'marketedBy',
            fieldLabel: 'Marketed By',
            fieldType: 'text',
            isMandatory: false,
            placeholder: 'Company name',
            order: 7,
          },
          {
            fieldName: 'quantity',
            fieldLabel: 'Product Quantity',
            fieldType: 'number',
            isMandatory: true,
            placeholder: '0',
            order: 8,
          },
        ],
        variants: [
          {
            variantName: 'color',
            variantLabel: 'Color',
            inputType: 'color',
            order: 1,
          },
          {
            variantName: 'size',
            variantLabel: 'Size',
            inputType: 'text',
            order: 2,
          },
          {
            variantName: 'model',
            variantLabel: 'Model/Series',
            inputType: 'text',
            order: 3,
          },
        ],
        staticFields: {
          brand: { enabled: true, isMandatory: true }, // Brand dropdown
          mfdOn: { enabled: true, isMandatory: true },
          bestBefore: { enabled: true, isMandatory: true },
        },
        isActive: true,
      });

      console.log('✅ Created default global form configuration');
      console.log(`   Form Name: ${defaultConfig.formName}`);
      console.log(`   Custom Fields: ${defaultConfig.customFields.length}`);
    }

    console.log('\n✨ Seeding completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding form config:', error);
    process.exit(1);
  }
}

seedDefaultFormConfig();
