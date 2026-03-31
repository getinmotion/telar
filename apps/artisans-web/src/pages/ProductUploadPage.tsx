import React from "react";
import { motion } from "framer-motion";
import { AIProductUploadWizard } from "@/components/shop/ai-upload/AIProductUploadWizard";
import { ProductUploadHeader } from "@/components/shop/ProductUploadHeader";

export const ProductUploadPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <ProductUploadHeader />
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <motion.div
          key="wizard"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AIProductUploadWizard />
        </motion.div>
      </div>
    </div>
  );
};
