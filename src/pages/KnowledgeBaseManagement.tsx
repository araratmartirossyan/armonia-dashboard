import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { KnowledgeBase, License, CreateKnowledgeBaseRequest, UpdateKnowledgeBaseRequest, AttachKnowledgeBaseRequest } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Plus, BookOpen, Link as LinkIcon, Upload, FileText, X, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export default function KnowledgeBaseManagement() {
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAttachDialogOpen, setIsAttachDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedKbId, setSelectedKbId] = useState('');
  const [selectedKbForUpload, setSelectedKbForUpload] = useState<KnowledgeBase | null>(null);
  const [selectedKbForEdit, setSelectedKbForEdit] = useState<KnowledgeBase | null>(null);
  const [selectedKbForDelete, setSelectedKbForDelete] = useState<KnowledgeBase | null>(null);
  const [selectedLicenseId, setSelectedLicenseId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<CreateKnowledgeBaseRequest>({
    name: '',
    description: '',
    promptInstructions: '',
  });
  const [editFormData, setEditFormData] = useState<UpdateKnowledgeBaseRequest>({
    name: '',
    description: '',
    promptInstructions: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [kbData, licensesData] = await Promise.all([
        api.getKnowledgeBases(),
        api.getLicenses(),
      ]);
      setKnowledgeBases(kbData);
      setLicenses(licensesData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKnowledgeBase = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create the knowledge base
      const newKnowledgeBase = await api.createKnowledgeBase({
        name: formData.name,
        description: formData.description || null,
        promptInstructions: formData.promptInstructions || null,
      });

      // Upload files if any were selected
      if (createFiles.length > 0) {
        try {
          await api.uploadFilesToKnowledgeBase(newKnowledgeBase.id, createFiles);
          toast({
            title: 'Success',
            description: `Knowledge base created and ${createFiles.length} file(s) uploaded successfully`,
          });
        } catch (uploadError: any) {
          // Knowledge base was created but file upload failed
          toast({
            title: 'Partial Success',
            description: `Knowledge base created but failed to upload files: ${uploadError.response?.data?.message || 'Upload error'}`,
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Success',
          description: 'Knowledge base created successfully',
        });
      }

      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', promptInstructions: '' });
      setCreateFiles([]);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create knowledge base',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Filter only PDF files
    const pdfFiles = files.filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length !== files.length) {
      toast({
        title: 'Warning',
        description: 'Only PDF files are supported. Non-PDF files were filtered out.',
        variant: 'destructive',
      });
    }

    setCreateFiles((prev) => [...prev, ...pdfFiles]);
  };

  const handleRemoveCreateFile = (index: number) => {
    setCreateFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAttachKnowledgeBase = async () => {
    if (!selectedKbId || !selectedLicenseId) {
      toast({
        title: 'Error',
        description: 'Please select both knowledge base and license',
        variant: 'destructive',
      });
      return;
    }

    try {
      const request: AttachKnowledgeBaseRequest = {
        kbId: selectedKbId,
        licenseId: selectedLicenseId,
      };
      await api.attachKnowledgeBase(request);
      toast({
        title: 'Success',
        description: 'Knowledge base attached successfully',
      });
      setIsAttachDialogOpen(false);
      setSelectedKbId('');
      setSelectedLicenseId('');
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to attach knowledge base',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Filter only PDF files
    const pdfFiles = files.filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length !== files.length) {
      toast({
        title: 'Warning',
        description: 'Only PDF files are supported. Non-PDF files were filtered out.',
        variant: 'destructive',
      });
    }

    setSelectedFiles((prev) => [...prev, ...pdfFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadFiles = async () => {
    if (!selectedKbForUpload) {
      toast({
        title: 'Error',
        description: 'No knowledge base selected',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one file to upload',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      await api.uploadFilesToKnowledgeBase(selectedKbForUpload.id, selectedFiles);
      toast({
        title: 'Success',
        description: `${selectedFiles.length} file(s) uploaded successfully`,
      });
      setIsUploadDialogOpen(false);
      setSelectedFiles([]);
      setSelectedKbForUpload(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const openUploadDialog = (kb: KnowledgeBase) => {
    setSelectedKbForUpload(kb);
    setSelectedFiles([]);
    setIsUploadDialogOpen(true);
  };

  const openEditDialog = (kb: KnowledgeBase) => {
    setSelectedKbForEdit(kb);
    setEditFormData({
      name: kb.name,
      description: kb.description || '',
      promptInstructions: kb.promptInstructions || '',
    });
    setEditFiles([]);
    setIsEditDialogOpen(true);
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Filter only PDF files
    const pdfFiles = files.filter((file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
    
    if (pdfFiles.length !== files.length) {
      toast({
        title: 'Warning',
        description: 'Only PDF files are supported. Non-PDF files were filtered out.',
        variant: 'destructive',
      });
    }

    setEditFiles((prev) => [...prev, ...pdfFiles]);
  };

  const handleRemoveEditFile = (index: number) => {
    setEditFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const openDeleteDialog = (kb: KnowledgeBase) => {
    setSelectedKbForDelete(kb);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateKnowledgeBase = async () => {
    if (!selectedKbForEdit || !editFormData.name?.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Update the knowledge base
      await api.updateKnowledgeBase(selectedKbForEdit.id, {
        name: editFormData.name,
        description: editFormData.description || null,
        promptInstructions: editFormData.promptInstructions || null,
      });

      // Upload new files if any were selected
      if (editFiles.length > 0) {
        try {
          await api.uploadFilesToKnowledgeBase(selectedKbForEdit.id, editFiles);
        } catch (uploadError: any) {
          // Knowledge base was updated but file upload failed
          toast({
            title: 'Partial Success',
            description: `Knowledge base updated but failed to upload files: ${uploadError.response?.data?.message || 'Upload error'}`,
            variant: 'destructive',
          });
          setIsEditDialogOpen(false);
          setSelectedKbForEdit(null);
          setEditFormData({ name: '', description: '', promptInstructions: '' });
          setEditFiles([]);
          loadData();
          return;
        }
      }

      toast({
        title: 'Success',
        description: `Knowledge base updated successfully${editFiles.length > 0 ? ` and ${editFiles.length} file(s) uploaded` : ''}`,
      });
      setIsEditDialogOpen(false);
      setSelectedKbForEdit(null);
      setEditFormData({ name: '', description: '', promptInstructions: '' });
      setEditFiles([]);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update knowledge base',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteKnowledgeBase = async () => {
    if (!selectedKbForDelete) return;

    setIsDeleting(true);
    try {
      await api.deleteKnowledgeBase(selectedKbForDelete.id);
      toast({
        title: 'Success',
        description: 'Knowledge base deleted successfully',
      });
      setIsDeleteDialogOpen(false);
      setSelectedKbForDelete(null);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete knowledge base',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Base Management</h1>
          <p className="text-muted-foreground">Manage knowledge bases and attach them to licenses</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAttachDialogOpen} onOpenChange={setIsAttachDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <LinkIcon className="mr-2 h-4 w-4" />
                Attach to License
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Attach Knowledge Base to License</DialogTitle>
                <DialogDescription>
                  Attach a knowledge base to a license
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="kb">Knowledge Base</Label>
                  <Select value={selectedKbId} onValueChange={setSelectedKbId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a knowledge base" />
                    </SelectTrigger>
                    <SelectContent>
                      {knowledgeBases.map((kb) => (
                        <SelectItem key={kb.id} value={kb.id}>
                          {kb.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license">License</Label>
                  <Select value={selectedLicenseId} onValueChange={setSelectedLicenseId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a license" />
                    </SelectTrigger>
                    <SelectContent>
                      {licenses.map((license) => (
                        <SelectItem key={license.id} value={license.id}>
                          {license.key} - {license.user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAttachDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAttachKnowledgeBase}>Attach</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog 
            open={isCreateDialogOpen} 
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) {
                setFormData({ name: '', description: '', promptInstructions: '' });
                setCreateFiles([]);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Knowledge Base
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Knowledge Base</DialogTitle>
                <DialogDescription>
                  Create a new knowledge base for RAG system. You can optionally upload PDF files during creation.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Knowledge base name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Knowledge base description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructions">Prompt Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={formData.promptInstructions || ''}
                    onChange={(e) => setFormData({ ...formData, promptInstructions: e.target.value })}
                    placeholder="Custom prompt instructions for this knowledge base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-file-upload">Upload PDF Files (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="create-file-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      multiple
                      onChange={handleCreateFileSelect}
                      className="cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only PDF files are supported. You can select multiple files at once.
                  </p>
                </div>

                {createFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({createFiles.length})</Label>
                    <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                      {createFiles.map((file, index) => (
                        <div
                          key={`create-${file.name}-${index}`}
                          className="flex items-center justify-between p-2 bg-muted rounded-md"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCreateFile(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateKnowledgeBase}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Plus className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create{createFiles.length > 0 ? ` & Upload ${createFiles.length} file(s)` : ''}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Bases</CardTitle>
          <CardDescription>All knowledge bases in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Prompt Instructions</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {knowledgeBases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No knowledge bases found
                  </TableCell>
                </TableRow>
              ) : (
                knowledgeBases.map((kb) => (
                  <TableRow key={kb.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {kb.name}
                      </div>
                    </TableCell>
                    <TableCell>{kb.description || '-'}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {kb.promptInstructions || '-'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(kb.createdAt), 'PPp')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(kb.updatedAt), 'PPp')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(kb)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUploadDialog(kb)}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteDialog(kb)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
          </Card>

      {/* Upload Files Dialog */}
      <Dialog 
        open={isUploadDialogOpen} 
        onOpenChange={(open) => {
          setIsUploadDialogOpen(open);
          if (!open) {
            setSelectedFiles([]);
            setSelectedKbForUpload(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Files to Knowledge Base</DialogTitle>
            <DialogDescription>
              Upload PDF files to {selectedKbForUpload?.name || 'knowledge base'}. You can select multiple files.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Select PDF Files</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Only PDF files are supported. You can select multiple files at once.
              </p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({selectedFiles.length})</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${index}`}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsUploadDialogOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUploadFiles}
              disabled={selectedFiles.length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : 'Files'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Knowledge Base Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedKbForEdit(null);
            setEditFormData({ name: '', description: '', promptInstructions: '' });
            setEditFiles([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Knowledge Base</DialogTitle>
            <DialogDescription>
              Update knowledge base information. You can upload new files to add to existing ones.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editFormData.name || ''}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Knowledge base name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Knowledge base description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-instructions">Prompt Instructions</Label>
              <Textarea
                id="edit-instructions"
                value={editFormData.promptInstructions || ''}
                onChange={(e) => setEditFormData({ ...editFormData, promptInstructions: e.target.value })}
                placeholder="Custom prompt instructions for this knowledge base"
              />
            </div>

            {/* Existing Files Section */}
            {selectedKbForEdit && selectedKbForEdit.documents && Object.keys(selectedKbForEdit.documents).length > 0 && (
              <div className="space-y-2">
                <Label>Existing Files</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto bg-muted/50">
                  {Object.keys(selectedKbForEdit.documents).map((key, index) => {
                    const doc = selectedKbForEdit.documents![key];
                    const fileName = typeof doc === 'object' && doc !== null && 'name' in doc 
                      ? String(doc.name) 
                      : key;
                    return (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{fileName}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {Object.keys(selectedKbForEdit.documents).length} file(s) currently attached
                </p>
              </div>
            )}

            {/* Upload New Files Section */}
            <div className="space-y-2">
              <Label htmlFor="edit-file-upload">Upload New PDF Files (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit-file-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  multiple
                  onChange={handleEditFileSelect}
                  className="cursor-pointer"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Only PDF files are supported. New files will be added to existing ones.
              </p>
            </div>

            {editFiles.length > 0 && (
              <div className="space-y-2">
                <Label>New Files to Upload ({editFiles.length})</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                  {editFiles.map((file, index) => (
                    <div
                      key={`edit-${file.name}-${index}`}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveEditFile(index)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateKnowledgeBase}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <Pencil className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Pencil className="mr-2 h-4 w-4" />
                  Update{editFiles.length > 0 ? ` & Upload ${editFiles.length} file(s)` : ''}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Knowledge Base Confirmation Dialog */}
      <Dialog 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setSelectedKbForDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Knowledge Base</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this knowledge base? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedKbForDelete && (
            <div className="py-4">
              <p className="text-sm">
                <strong>Name:</strong> {selectedKbForDelete.name}
              </p>
              {selectedKbForDelete.description && (
                <p className="text-sm mt-2">
                  <strong>Description:</strong> {selectedKbForDelete.description}
                </p>
              )}
              <p className="text-sm mt-2 text-destructive">
                <strong>Warning:</strong> All documents and data associated with this knowledge base will be permanently deleted.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteKnowledgeBase}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Trash2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

