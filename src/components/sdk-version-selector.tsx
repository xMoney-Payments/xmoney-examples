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

  const displayValue = selectedVersion
    ? `${selectedVersion.value} - ${selectedVersion.label}`
    : version

  return (
    <Select value={version} onValueChange={handleVersionChange}>
      <SelectTrigger
        className='h-9 w-[4.5rem] shrink-0 px-2 text-xs font-medium md:w-[180px] md:px-3'
        aria-label='Select SDK version'
      >
        <SelectValue placeholder='SDK version'>
          <span className='truncate md:hidden'>{version}</span>
          <span className='hidden truncate md:inline'>{displayValue}</span>
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
