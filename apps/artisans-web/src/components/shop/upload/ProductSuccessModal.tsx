import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Edit, Plus, Package, Store } from 'lucide-react';

interface ProductSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onEditProduct: () => void;
  onUploadAnother: () => void;
  onViewInventory: () => void;
  onViewShop: () => void;
}

export const ProductSuccessModal: React.FC<ProductSuccessModalProps> = ({
  isOpen,
  onClose,
  productId,
  productName,
  onEditProduct,
  onUploadAnother,
  onViewInventory,
  onViewShop,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
            >
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
            </motion.div>
          </div>
          
          <DialogTitle className="text-center text-2xl">
            ¡Producto Publicado!
          </DialogTitle>
          
          <DialogDescription className="text-center">
            <span className="font-medium text-foreground">"{productName}"</span> ya está disponible en tu tienda
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            onClick={onViewShop}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all"
            size="lg"
          >
            <Store className="w-4 h-4 mr-2" />
            Ver en mi tienda
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onEditProduct}
              variant="outline"
              className="w-full"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar ahora
            </Button>

            <Button
              onClick={onUploadAnother}
              variant="outline"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Subir otro
            </Button>
          </div>

          <Button
            onClick={onViewInventory}
            variant="ghost"
            className="w-full"
          >
            <Package className="w-4 h-4 mr-2" />
            Ir al inventario
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
