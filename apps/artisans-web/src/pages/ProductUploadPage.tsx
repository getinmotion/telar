import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Package, Wand2 } from "lucide-react";
import { AIProductUploadWizard } from "@/components/shop/ai-upload/AIProductUploadWizard";
import { QuickPublishCard } from "@/components/shop/quick-publish/QuickPublishCard";
import { BatchUploadInterface } from "@/components/shop/batch-upload/BatchUploadInterface";
import { ProductUploadHeader } from "@/components/shop/ProductUploadHeader";
import { UploadMethodSelector } from "@/components/shop/upload/UploadMethodSelector";
import { useUserLocalStorage } from "@/hooks/useUserLocalStorage";

export const ProductUploadPage: React.FC = () => {
  const userLocalStorage = useUserLocalStorage();
  const [showSelector, setShowSelector] = useState(false);
  const [activeTab, setActiveTab] = useState("wizard");

  useEffect(() => {
    const hasSeenSelector = userLocalStorage.getItem(
      "product-upload-method-selected",
    );
    if (!hasSeenSelector) {
      setShowSelector(true);
    }
  }, [userLocalStorage]);

  const handleMethodSelect = (method: "wizard") => {
    setActiveTab(method);
    setShowSelector(false);
    userLocalStorage.setItem("product-upload-method-selected", "true");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <ProductUploadHeader />
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {showSelector ? (
          <UploadMethodSelector onSelectMethod={handleMethodSelect} />
        ) : (
          <>
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsContent value="wizard" className="mt-0">
                <motion.div
                  key="wizard"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <AIProductUploadWizard />
                </motion.div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
};
