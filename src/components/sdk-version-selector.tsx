import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLocalStorage } from '@/hooks/use-local-storage'
import {
  DEFAULT_SDK_VERSION,
  SDK_VERSIONS,
  SDK_VERSION_STORAGE_KEY,
} from '@/lib/sdk-versions'

export function SdkVersionSelector() {
  const [version, setVersion] = useLocalStorage(
    SDK_VERSION_STORAGE_KEY,
    DEFAULT_SDK_VERSION
  )

  const selectedVersion = SDK_VERSIONS.find((item) => item.value === version)

  const handleVersionChange = (nextVersion: string) => {
    if (nextVersion === version) return

    setVersion(nextVersion)
    window.location.reload()
  }

  return (
    <Select value={version} onValueChange={handleVersionChange}>
      <SelectTrigger
        className='w-[180px] h-9 text-xs font-medium'
        aria-label='Select SDK version'
      >
        <SelectValue placeholder='SDK version'>
          {selectedVersion
            ? `${selectedVersion.value} - ${selectedVersion.label}`
            : version}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className='max-h-72'>
        {SDK_VERSIONS.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.value} - {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
