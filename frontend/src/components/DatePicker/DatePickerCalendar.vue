<template>
  <div class="calendar flex-col">
    <div class="week-days flex-row">
      <div
        v-for="weekDay in weekDays"
        :key="weekDay"
        class="day flex-col">
        {{ weekDay[0] }}
      </div>
    </div>

    <div class="days">
      <div
        v-for="row in daysByRow"
        :key="daysByRow.indexOf(row)"
        class="row flex-row">
        <div
          v-for="date in row"
          :key="date.day+date.month+date.year"
          class="day flex-col"
          :class="{ 'current-month': date.month === currentMonth,
                    'in-between-hover': dateBetween(date, hoverDate, startDate),
                    'in-between-selected': (sameDates(date, startDate) || sameDates(date, endDate)) || dateBetween(date, startDate, endDate) }"
          @mouseenter="toggleHoverDate(date)"
          @mouseleave="toggleHoverDate(date)"
          @click="selectDate(date)">
          {{ date.day }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { sameDates } from '../../helpers/misc'

export default {
  name: 'DatePickerCalendar',
  computed: {
    ...mapGetters([
      'weekDays',
      'daysByRow',
      'currentMonth',
      'startDate',
      'endDate',
      'hoverDate',
      'dateBetween'
    ])
  },
  methods: {
    ...mapActions([
      'selectDate',
      'toggleHoverDate'
    ]),
    sameDates: function (date1, date2) {
      return sameDates(date1, date2)
    }
  }
}
</script>

<style src="./DatePickerCalendar.scss" lang="scss" scoped></style>
