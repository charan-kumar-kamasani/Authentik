file_path = '/Users/charankumarkamasani/Projects/authentik/backend/src/routes/order.routes.js'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update Create order logic
# Find: pointsDisbursed: 0,
#       } : undefined,
#       // Calculate and save pricing
if "supplyChain: req.body.supplyChain ? req.body.supplyChain : undefined," not in content:
    find_str = """      } : undefined,
      // Calculate and save pricing"""
    replace_str = """      } : undefined,
      // Supply Chain Details (if provided)
      supplyChain: req.body.supplyChain ? req.body.supplyChain : undefined,
      // Calculate and save pricing"""
    content = content.replace(find_str, replace_str)

# 2. Update Edit order logic
# Find:
#     // Update loyalty if provided
#     if (req.body.loyalty !== undefined) {
#       order.loyalty = (req.body.loyalty && req.body.loyalty.isActive) ? {
#         ...
#       } : undefined;
#     }
#     
#     order.history.push({

if "if (req.body.supplyChain !== undefined) {" not in content:
    find_str2 = """      } : undefined;
    }

    order.history.push({"""
    
    replace_str2 = """      } : undefined;
    }
    // Update supplyChain if provided
    if (req.body.supplyChain !== undefined) {
      order.supplyChain = req.body.supplyChain;
    }

    order.history.push({"""
    content = content.replace(find_str2, replace_str2)

with open(file_path, 'w') as f:
    f.write(content)

print("Done routes update")
