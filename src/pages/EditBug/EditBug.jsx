import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'
import { bugs } from '../../utils/mockData.js'
import { BugForm } from '../CreateBug/CreateBug.jsx'

export default function EditBug() {
  const { id } = useParams()
  const navigate = useNavigate()
  const bug = bugs.find((item) => item.id === id) || bugs[0]
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: bug })

  const onSubmit = () => {
    toast.success('Bug updated')
    navigate(`/bugs/${bug.id}`)
  }

  return <BugForm title={`Edit ${bug.id}`} text="Update assignment, status, priority, severity, evidence, and reproduction notes." onSubmit={handleSubmit(onSubmit)} register={register} errors={errors} />
}
