
import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const CompanyDocuments = () => {
  const documents = [
    {
      title: "One Pager",
      description: "Resumen ejecutivo de una página del proyecto Motion",
      path: "/one-pager",
      icon: FileText,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Two Pager", 
      description: "Descripción extendida en dos páginas del proyecto",
      path: "/two-pager",
      icon: FileText,
      color: "from-purple-500 to-violet-500"
    },
    {
      title: "Three Pager",
      description: "Documento completo de tres páginas con todos los detalles",
      path: "/three-pager", 
      icon: FileText,
      color: "from-indigo-500 to-blue-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary">
            Documentos Corporativos
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestiona y accede a los documentos oficiales del proyecto
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc, index) => (
          <Card key={index} className="bg-card/40 border-border/30 hover:bg-card/60 transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${doc.color} flex items-center justify-center`}>
                  <doc.icon className="w-6 h-6 text-white" />
                </div>
                <Link 
                  to={doc.path}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
              <CardTitle className="text-foreground">{doc.title}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {doc.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link 
                to={doc.path}
                className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/30 rounded-lg text-primary hover:bg-primary/20 transition-all duration-200"
                target="_blank"
              >
                <FileText className="w-4 h-4 mr-2" />
                Ver Documento
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card/40 border-border/30">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-muted-foreground font-medium mb-2">Email General</h4>
              <p className="text-foreground">info@motionproject.com</p>
            </div>
            <div>
              <h4 className="text-muted-foreground font-medium mb-2">Email de Soporte</h4>
              <p className="text-foreground">support@motionproject.com</p>
            </div>
            <div>
              <h4 className="text-muted-foreground font-medium mb-2">Email de Partnerships</h4>
              <p className="text-foreground">partnerships@motionproject.com</p>
            </div>
            <div>
              <h4 className="text-muted-foreground font-medium mb-2">Email de Inversores</h4>
              <p className="text-foreground">investors@motionproject.com</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
