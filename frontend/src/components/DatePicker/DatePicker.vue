<template>
  <div
    id="date-picker"
    class="flex-col">
    <DatePickerHeader />
    <DatePickerCalendar />
    <DatePickerFooter />
  </div>
</template>

<script>
import DatePickerHeader from './DatePickerHeader'
import DatePickerCalendar from './DatePickerCalendar'
import DatePickerFooter from './DatePickerFooter'

export default {
  name: 'DatePicker',
  components: {
    'DatePickerHeader': DatePickerHeader,
    'DatePickerCalendar': DatePickerCalendar,
    'DatePickerFooter': DatePickerFooter
  }
}
</script>

<style src="./DatePicker.scss" lang="scss" scoped></style>
