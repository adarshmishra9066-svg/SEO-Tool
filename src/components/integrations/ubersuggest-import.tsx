'use client'

import * as React from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

type ImportType = 'keyword_ideas' | 'competitor_keywords' | 'backlinks' | 'site_audit'

const IMPORT_TYPES: { value: ImportType; label: string; description: string }[] = [
  { value: 'keyword_ideas', label: 'Keyword Ideas', description: 'Keyword suggestions from Ubersuggest' },
  { value: 'competitor_keywords', label: 'Competitor Keywords', description: 'Keywords your competitors rank for' },
  { value: 'backlinks', label: 'Backlink Prospects', description: 'Backlink opportunity sites' },
  { value: 'site_audit', label: 'Site Audit Issues', description: 'Technical issues from site audit' },
]

// Expected internal field names per import type
const FIELD_MAPPINGS: Record<ImportType, string[]> = {
  keyword_ideas: ['keyword', 'search_volume', 'difficulty', 'cpc', 'position', 'page_url', 'intent'],
  competitor_keywords: ['keyword', 'search_volume', 'difficulty', 'cpc', 'position', 'page_url', 'intent'],
  backlinks: ['website', 'domain_authority', 'domain_rating', 'traffic', 'spam_score', 'niche', 'contact_email'],
  site_audit: ['title', 'severity', 'issue_type', 'page_url', 'description', 'fix'],
}

function parseCSVHeaders(content: string): string[] {
  const firstLine = content.split('\n')[0] ?? ''
  return firstLine.split(',').map((h) => h.replace(/"/g, '').trim())
}

interface ImportResult {
  success: boolean
  processed_count: number
  total_rows: number
  import_id: string | null
}

interface UbersuggestImportProps {
  clientId: string
}

export function UbersuggestImport({ clientId }: UbersuggestImportProps) {
  const [importType, setImportType] = React.useState<ImportType>('keyword_ideas')
  const [file, setFile] = React.useState<File | null>(null)
  const [csvContent, setCsvContent] = React.useState<string>('')
  const [csvHeaders, setCsvHeaders] = React.useState<string[]>([])
  const [previewRows, setPreviewRows] = React.useState<string[][]>([])
  const [columnMapping, setColumnMapping] = React.useState<Record<string, string>>({})
  const [importing, setImporting] = React.useState(false)
  const [result, setResult] = React.useState<ImportResult | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [showMapping, setShowMapping] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const processFile = async (selectedFile: File) => {
    setFile(selectedFile)
    setResult(null)

    const text = await selectedFile.text()
    setCsvContent(text)

    const headers = parseCSVHeaders(text)
    setCsvHeaders(headers)

    // Parse first 5 data rows for preview
    const lines = text.split('\n').filter((l) => l.trim())
    const dataLines = lines.slice(1, 6)
    const rows = dataLines.map((line) =>
      line.split(',').map((v) => v.replace(/"/g, '').trim())
    )
    setPreviewRows(rows)

    // Auto-detect column mapping
    const autoMapping: Record<string, string> = {}
    const fields = FIELD_MAPPINGS[importType]
    fields.forEach((field) => {
      // Try to find a matching header
      const match = headers.find((h) => {
        const hl = h.toLowerCase()
        if (field === 'keyword') return hl.includes('keyword')
        if (field === 'search_volume') return hl.includes('volume') || hl.includes('searches')
        if (field === 'difficulty') return hl.includes('difficulty') || hl === 'kd'
        if (field === 'cpc') return hl === 'cpc' || hl.includes('cost per click')
        if (field === 'position') return hl === 'position' || hl === 'rank'
        if (field === 'page_url') return hl === 'url' || hl.includes('page') || hl.includes('link')
        if (field === 'intent') return hl.includes('intent')
        if (field === 'website') return hl.includes('domain') || hl.includes('source') || hl.includes('site')
        if (field === 'domain_authority') return hl === 'da' || hl.includes('domain authority')
        if (field === 'domain_rating') return hl === 'dr' || hl.includes('domain rating')
        if (field === 'traffic') return hl.includes('traffic')
        if (field === 'spam_score') return hl.includes('spam')
        if (field === 'niche') return hl.includes('niche') || hl.includes('category')
        if (field === 'contact_email') return hl.includes('email')
        if (field === 'title') return hl.includes('issue') || hl.includes('error') || hl === 'title'
        if (field === 'severity') return hl.includes('severity') || hl.includes('priority')
        if (field === 'issue_type') return hl.includes('type') || hl.includes('category')
        if (field === 'description') return hl.includes('description') || hl.includes('detail')
        if (field === 'fix') return hl.includes('recommendation') || hl.includes('fix')
        return false
      })
      if (match) autoMapping[field] = match
    })

    setColumnMapping(autoMapping)
    setShowMapping(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) processFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && f.name.endsWith('.csv')) {
      processFile(f)
    } else {
      toast({ title: 'Please upload a CSV file', variant: 'destructive' })
    }
  }

  const handleImport = async () => {
    if (!file || !csvContent) return
    setImporting(true)

    try {
      const formData = new FormData()
      formData.append('client_id', clientId)
      formData.append('import_type', importType)
      formData.append('file', new Blob([csvContent], { type: 'text/csv' }), file.name)
      formData.append('column_mapping', JSON.stringify(columnMapping))

      const res = await fetch('/api/ubersuggest/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json() as ImportResult & { error?: string }

      if (!res.ok) throw new Error(data.error ?? 'Import failed')

      setResult(data)
      toast({
        title: `Import complete`,
        description: `${data.processed_count} of ${data.total_rows} rows processed`,
        variant: 'success',
      })
    } catch (err) {
      toast({ title: 'Import failed', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setCsvContent('')
    setCsvHeaders([])
    setPreviewRows([])
    setColumnMapping({})
    setResult(null)
    setShowMapping(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const fields = FIELD_MAPPINGS[importType]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Upload className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-base">Ubersuggest CSV Import</CardTitle>
            <CardDescription className="text-xs">
              Import keyword ideas, backlink prospects, or site audit data from Ubersuggest CSV exports
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Import type selector */}
        <div>
          <Label className="text-xs font-medium">Import Type</Label>
          <Select
            value={importType}
            onValueChange={(v) => {
              setImportType(v as ImportType)
              setColumnMapping({})
              setShowMapping(false)
            }}
          >
            <SelectTrigger className="mt-1 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMPORT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  <div>
                    <div className="font-medium text-sm">{t.label}</div>
                    <div className="text-xs text-gray-400">{t.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drop zone */}
        {!file ? (
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
              isDragging
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            )}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">Drop your CSV file here</p>
            <p className="text-xs text-gray-400 mt-1">or click to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <FileText className="w-5 h-5 text-gray-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB · {csvHeaders.length} columns · {previewRows.length}+ rows
              </p>
            </div>
            <button onClick={handleReset} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Preview */}
        {previewRows.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Preview (first 5 rows)</p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="text-xs w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {csvHeaders.slice(0, 6).map((h) => (
                      <th key={h} className="px-2 py-1.5 text-left font-medium text-gray-600 border-b border-gray-200 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                    {csvHeaders.length > 6 && (
                      <th className="px-2 py-1.5 text-left font-medium text-gray-400 border-b border-gray-200">
                        +{csvHeaders.length - 6} more
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 last:border-0">
                      {row.slice(0, 6).map((val, j) => (
                        <td key={j} className="px-2 py-1.5 text-gray-600 max-w-[120px] truncate">
                          {val || '—'}
                        </td>
                      ))}
                      {csvHeaders.length > 6 && <td className="px-2 py-1.5 text-gray-300">…</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Column mapping */}
        {showMapping && csvHeaders.length > 0 && (
          <div>
            <button
              className="flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
              onClick={() => setShowMapping((v) => !v)}
            >
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', showMapping ? '' : '-rotate-90')} />
              Column Mapping
            </button>

            <div className="mt-2 space-y-2">
              {fields.map((field) => (
                <div key={field} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-28 shrink-0 font-mono">{field}</span>
                  <Select
                    value={columnMapping[field] ?? '__none__'}
                    onValueChange={(v) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        [field]: v === '__none__' ? '' : v,
                      }))
                    }
                  >
                    <SelectTrigger className="h-7 text-xs flex-1">
                      <SelectValue placeholder="Skip this field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Skip this field</SelectItem>
                      {csvHeaders.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className={cn(
              'flex items-center gap-2 p-3 rounded-lg text-sm border',
              result.success
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            )}
          >
            {result.success ? (
              <CheckCircle className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>
              {result.success
                ? `Successfully imported ${result.processed_count} of ${result.total_rows} rows`
                : 'Import failed — no rows processed'}
            </span>
          </div>
        )}

        {/* Import button */}
        {file && !result && (
          <Button
            onClick={handleImport}
            disabled={importing}
            className="w-full"
          >
            {importing ? (
              <>
                <Upload className="w-3.5 h-3.5 mr-2 animate-pulse" />
                Importing…
              </>
            ) : (
              `Import ${IMPORT_TYPES.find((t) => t.value === importType)?.label}`
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
