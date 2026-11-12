import { format } from 'date-fns'

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '-'
  return format(new Date(dateString), 'MMM dd, yyyy')
}
export default formatDate