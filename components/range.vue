<!-- 日期搜索框 -->
<template>
  <div class="date-range-container">
    <dateSlidePicker
      class="date-picker"
      :size="size"
      :select-range="selectRange"
      placeholder="开始日期"
      v-model="beginTime" />
    <dateSlidePicker
      class="date-picker"
      :size="size"
      :select-range="selectRange"
      placeholder="结束日期"
      v-model="endTime" />
  </div>
</template>

<script>
import dateSlidePicker from './index'
const myDate = new Date();

export default {
  name: 'el-date-slide-picker-range',
  props: {
    value: Array,
    size: {
      type: String,
      default: 'small'
    },
    selectRange: {
      type: Array,
      default: () => ['2016/01/01', `${myDate.getFullYear()}/${myDate.getMonth() + 1}/${myDate.getDate()}`]
    }
  },
  components: {
    dateSlidePicker
  },
  data() {
    return {
      beginTime: '',
      endTime: ''
    };
  },
  watch: {
    value(newVal) {
      this.beginTime = newVal[0];
      this.endTime = newVal[1];
    },
    beginTime(newVal, oldVal) {
      this.emitDateRange();
    },
    endTime(newVal) {
      this.emitDateRange();
    }
  },
  model: {
    prop: 'value',
    event: 'updateVal'
  },
  methods: {
    emitDateRange() {
      const { beginTime, endTime } = this;
      this.$emit('updateVal', [beginTime, endTime]);
      // this.$emit('change', [beginTime, endTime]);
    }
  }
};
</script>
<style lang="scss" scoped>
.date-range-container {
  display: flex;
  justify-content: space-between;
}
  .date-picker {
    width: 48.5%;
  }
</style>
