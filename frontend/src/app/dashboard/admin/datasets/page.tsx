'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useDropzone } from 'react-dropzone';
import { datasetApi } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';
import type { DatasetAsset, DatasetProject, DatasetStats } from '@/types';
import {
  ArrowLeft,
  FolderKanban,
  Upload,
  ImagePlus,
  Trash2,
  Pencil,
  Split,
  Database,
  BarChart3,
  RefreshCw,
  FileUp,
  Layers3,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DatasetManagerPage() {
  const { t } = useLanguage();
  const [datasets, setDatasets] = useState<DatasetProject[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [selectedAssets, setSelectedAssets] = useState<DatasetAsset[]>([]);
  const [selectedStats, setSelectedStats] = useState<DatasetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [split, setSplit] = useState<'train' | 'val' | 'test'>('train');
  const [assetType, setAssetType] = useState<'image' | 'label' | 'zip'>('image');
  const [files, setFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    classes: 'good,scratch,dent,crack,contamination,missing_part',
  });

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === selectedId) || datasets[0] || null,
    [datasets, selectedId],
  );

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const res = await datasetApi.list();
      const items = (res.data || []) as DatasetProject[];
      setDatasets(items);
      if (!selectedId && items[0]) {
        setSelectedId(items[0].id);
      }
    } catch (error) {
      toast.error(t.loadDatasetError);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedDetails = async (datasetId: string) => {
    try {
      const [assetsRes, statsRes] = await Promise.all([datasetApi.assets(datasetId), datasetApi.stats(datasetId)]);
      setSelectedAssets((assetsRes.data || []) as DatasetAsset[]);
      setSelectedStats(statsRes.data as DatasetStats);
    } catch (error) {
      setSelectedAssets([]);
      setSelectedStats(null);
    }
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (selectedId) {
      fetchSelectedDetails(selectedId);
    }
  }, [selectedId]);

  const onDrop = (accepted: File[]) => {
    setFiles((current) => [...current, ...accepted]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 500 * 1024 * 1024,
  });

  const createDataset = async () => {
    if (!form.name.trim()) {
      toast.error(t.enterDatasetName);
      return;
    }
    setCreating(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || undefined,
        classes: form.classes.split(',').map((item) => item.trim()).filter(Boolean),
        storage_backend: 'local',
      };
      const res = await datasetApi.create(payload);
      const created = res.data as DatasetProject;
      toast.success(t.datasetCreated);
      setDatasets((current) => [created, ...current]);
      setSelectedId(created.id);
      setForm({ name: '', slug: '', description: '', classes: form.classes });
    } catch (error) {
      toast.error(t.failedCreateDataset);
    } finally {
      setCreating(false);
    }
  };

  const uploadFiles = async () => {
    if (!selectedDataset || files.length === 0) {
      toast.error(t.selectDatasetAndFile);
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('split', split);
      formData.append('asset_type', assetType);
      files.forEach((file) => formData.append('files', file));

      if (assetType === 'zip') {
        await datasetApi.uploadZip(selectedDataset.id, formData);
      } else {
        await datasetApi.upload(selectedDataset.id, formData);
      }

      toast.success(t.filesUploaded);
      setFiles([]);
      fetchDatasets();
      fetchSelectedDetails(selectedDataset.id);
    } catch (error) {
      toast.error(t.uploadFailed);
    } finally {
      setUploading(false);
    }
  };

  const renameDataset = async (dataset: DatasetProject) => {
    const name = window.prompt(t.newDatasetName, dataset.name);
    if (!name) return;
    try {
      await datasetApi.update(dataset.id, { name });
      toast.success(t.datasetRenamed);
      fetchDatasets();
    } catch (error) {
      toast.error(t.renameFailed);
    }
  };

  const removeDataset = async (dataset: DatasetProject) => {
    if (!window.confirm(t.deleteDatasetConfirm)) return;
    try {
      await datasetApi.remove(dataset.id);
      toast.success(t.datasetDeleted);
      setSelectedId('');
      fetchDatasets();
    } catch (error) {
      toast.error(t.deleteFailed);
    }
  };

  const splitDataset = async () => {
    if (!selectedDataset) return;
    try {
      await datasetApi.split(selectedDataset.id, { strategy: 'ratio', train_ratio: 0.8, val_ratio: 0.1, test_ratio: 0.1 });
      toast.success(t.splitUpdated);
      fetchDatasets();
      fetchSelectedDetails(selectedDataset.id);
    } catch (error) {
      toast.error(t.failedSplitDataset);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="/dashboard/admin" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-white mb-3">
            <ArrowLeft size={16} /> {t.backToAdminHub}
          </Link>
          <h1 className="text-4xl font-black text-white tracking-tight">{t.datasetManagerTitle}</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            {t.datasetManagerSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-bold text-slate-400">
          <InfoChip icon={<FolderKanban size={14} />} label={t.datasetsLabel} value={datasets.length} />
          <InfoChip icon={<ImagePlus size={14} />} label={t.assetsLabel} value={selectedAssets.length} />
          <InfoChip icon={<BarChart3 size={14} />} label={t.classesLabel} value={selectedStats?.classes?.length || 0} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-[0.2em]"><Upload size={14} /> {t.createDatasetProject}</div>
            <div className="space-y-3">
              <input className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white" placeholder={t.datasetNamePlaceholder} value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
              <input className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white" placeholder={t.optionalSlug} value={form.slug} onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))} />
              <textarea className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white min-h-[100px]" placeholder={t.datasetDescriptionPlaceholder} value={form.description} onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))} />
              <input className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white" placeholder={t.classesPlaceholder} value={form.classes} onChange={(e) => setForm((current) => ({ ...current, classes: e.target.value }))} />
              <button onClick={createDataset} disabled={creating} className="w-full rounded-2xl py-3 font-black text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all">
                {creating ? t.creating : t.createDatasetBtn}
              </button>
            </div>
          </div>

          <div className="premium-card p-6 space-y-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-[0.2em]"><Split size={14} /> {t.uploadAndSplit}</div>
            <div {...getRootProps()} className={`rounded-3xl border-2 border-dashed px-4 py-8 text-center transition-all ${isDragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5'}`}>
              <input {...getInputProps()} />
              <FileUp className="mx-auto mb-3 text-indigo-400" size={30} />
              <p className="text-sm font-bold text-white">{isDragActive ? t.dropFilesHere : t.dragDropOrClick}</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, TXT, ZIP</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={assetType} onChange={(e) => setAssetType(e.target.value as any)} className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white">
                <option value="image">Image</option>
                <option value="label">Label</option>
                <option value="zip">ZIP</option>
              </select>
              <select value={split} onChange={(e) => setSplit(e.target.value as any)} className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-white">
                <option value="train">Train</option>
                <option value="val">Validation</option>
                <option value="test">Test</option>
              </select>
            </div>
            <button onClick={uploadFiles} disabled={uploading || !selectedDataset || files.length === 0} className="w-full rounded-2xl py-3 font-black text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all">
              {uploading ? t.uploading : t.uploadToDataset}
            </button>
            <button onClick={splitDataset} className="w-full rounded-2xl py-3 font-black text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
              {t.recomputeSplit}
            </button>
            <div className="text-xs text-slate-500 flex items-center gap-2"><RefreshCw size={12} /> {t.largeUploadSupport}</div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard label={t.totalImages} value={selectedStats?.image_count || 0} />
            <StatCard label={t.totalLabels} value={selectedStats?.label_count || 0} />
            <StatCard label={t.trainValTest} value={`${selectedStats?.train_count || 0}/${selectedStats?.val_count || 0}/${selectedStats?.test_count || 0}`} isText />
            <StatCard label={t.classesLabel} value={selectedStats?.classes?.length || 0} />
          </div>

          <div className="premium-card overflow-hidden">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2"><Database size={18} className="text-indigo-400" /> {t.datasetList}</h2>
                <p className="text-sm text-slate-500 mt-1">{t.selectDatasetToInspect}</p>
              </div>
              <div className="text-xs text-slate-500 uppercase tracking-[0.2em] font-black">{selectedDataset?.slug || '—'}</div>
            </div>
            <div className="divide-y divide-white/5">
              {loading && <div className="p-8 text-center text-slate-500">{t.loading}</div>}
              {!loading && datasets.map((dataset) => {
                const active = dataset.id === selectedDataset?.id;
                return (
                  <button key={dataset.id} onClick={() => setSelectedId(dataset.id)} className={`w-full text-left p-5 transition-colors ${active ? 'bg-indigo-500/10' : 'hover:bg-white/[0.02]'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 text-white font-black text-lg"><FolderKanban size={16} className="text-indigo-400" /> {dataset.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{dataset.slug} · {dataset.storage_backend}</div>
                        <div className="text-sm text-slate-400 mt-2 line-clamp-2">{dataset.description || t.noDescription}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(event) => { event.stopPropagation(); renameDataset(dataset); }} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-slate-300 hover:text-white">
                          <Pencil size={14} className="inline mr-1" /> {t.rename}
                        </button>
                        <button onClick={(event) => { event.stopPropagation(); removeDataset(dataset); }} className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-300 hover:text-red-200">
                          <Trash2 size={14} className="inline mr-1" /> {t.delete}
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-500">
                      <MiniStat label={t.totalImages} value={dataset.image_count} />
                      <MiniStat label={t.totalLabels} value={dataset.label_count} />
                      <MiniStat label="Split" value={`${dataset.train_count}/${dataset.val_count}/${dataset.test_count}`} />
                      <MiniStat label={t.classesLabel} value={dataset.classes?.length || 0} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="premium-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-black text-white">{t.assetPreview}</h2>
                  <p className="text-sm text-slate-500">{selectedDataset?.slug || t.noDatasetSelected}</p>
                </div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{selectedAssets.length} files</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[540px] overflow-auto pr-2">
                {selectedAssets.map((asset) => (
                  <div key={asset.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                    <div className="aspect-square bg-slate-900 flex items-center justify-center">
                      {asset.preview_url ? <img src={asset.preview_url} className="w-full h-full object-cover" alt={asset.file_name} /> : <Layers3 className="text-slate-700" />}
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-bold text-white truncate">{asset.file_name}</div>
                      <div className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.2em]">{asset.split} · {asset.asset_type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-black uppercase tracking-[0.2em]"><BarChart3 size={14} /> {t.defectDistribution}</div>
              <div className="space-y-3">
                {Object.entries(selectedStats?.defect_distribution || {}).map(([label, value]) => (
                  <div key={label} className="space-y-1.5">
                    <div className="flex justify-between text-sm font-bold"><span className="text-slate-300">{label}</span><span className="text-indigo-400">{String(value)}</span></div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: `${Math.min((value as number) * 10, 100)}%` }} /></div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/5 text-sm text-slate-500 leading-relaxed">
                {t.datasetStorageNote}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ icon, label, value }: any) {
  return <div className="px-4 py-2 rounded-xl border border-white/5 bg-white/5 flex items-center gap-2">{icon}<span>{label}: {value}</span></div>;
}

function StatCard({ label, value, isText = false }: any) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-500 font-black">{label}</div>
      <div className={`mt-3 text-3xl font-black text-white ${isText ? 'text-lg' : ''}`}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: any) {
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
      <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500 font-black">{label}</div>
      <div className="text-sm font-bold text-white mt-1">{value}</div>
    </div>
  );
}
