<!-- 日期搜索框 -->
<template>
  <div class="date-select-container">
    <el-popover
      title=""
      trigger="click"
      popper-class="el-time-panel el-time-panel-no-padding"
      content=""
      transition="el-zoom-in-top"
      v-model="visible"
      @hide="popperHideHandler"
    >
      <el-input
        clearable
        :size="size"
        :placeholder="placeholder"
        slot="reference"
        v-model="selectDate"
      >
        <!-- <i slot="prefix" class="el-input__icon el-icon-date"></i> -->
        <i
          slot="suffix"
          class="el-input__icon el-icon-arrow-up"
          :class="[!visible ? 'is-reverse' : '']"
        ></i>
      </el-input>
      <div class="el-time-panel__content">
        <div class="el-time-spinner has-seconds">
          <el-scrollbar
            @mouseenter.native="emitSelectRange('years')"
            @mousemove.native="adjustCurrentSpinner('years')"
            class="el-time-spinner__wrapper"
            wrap-style="max-height: inherit;"
            view-class="el-time-spinner__list"
            noresize
            tag="ul"
            ref="years"
          >
            <li
              @click="handleClick('years', index, item.disabled)"
              v-for="(item, index) in years"
              :key="item.value"
              class="el-time-spinner__item"
              :class="{ active: index === yearsModel, 'disabled': item.disabled  }"
            >
              {{ item.label }}
            </li>
          </el-scrollbar>
          <el-scrollbar
            @mouseenter.native="emitSelectRange('months')"
            @mousemove.native="adjustCurrentSpinner('months')"
            class="el-time-spinner__wrapper"
            wrap-style="max-height: inherit;"
            view-class="el-time-spinner__list"
            noresize
            tag="ul"
            ref="months"
          >
            <li
              @click="handleClick('months', index, item.disabled)"
              v-for="(item, index) in months"
              :key="item.value"
              class="el-time-spinner__item"
              :class="{ active: index === monthsModel, 'disabled': item.disabled  }"
            >
              {{ item.label }}
            </li>
          </el-scrollbar>
          <el-scrollbar
            @mouseenter.native="emitSelectRange('days')"
            @mousemove.native="adjustCurrentSpinner('days')"
            class="el-time-spinner__wrapper"
            wrap-style="max-height: inherit;"
            view-class="el-time-spinner__list"
            noresize
            tag="ul"
            ref="days"
          >
            <li
              @click="handleClick('days', index, item.disabled)"
              v-for="(item, index) in days"
              :key="item.value"
              class="el-time-spinner__item"
              :class="{ active: index === daysModel, 'disabled': item.disabled  }"
            >
              {{ item.label }}
            </li>
          </el-scrollbar>
        </div>
      </div>
      <div class="el-time-panel__footer">
        <button
          type="button"
          class="el-time-panel__btn cancel"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          type="button"
          class="el-time-panel__btn confirm"
          @click="handleConfirm"
        >
          确定
        </button>
      </div>
    </el-popover>
  </div>
</template>

<script>
import moment from 'moment'
const myDate = new Date();
const beginYear = 1990; // 此处为开始年份

export default {
  name: "el-date-slide-picker",
  props: {
    value: String,
    placeholder: {
      type: String,
      default: "small"
    },
    size: {
      type: String,
      default: "small"
    },
    selectRange: {
      type: Array,
      default: () => ['2016-01-01', `${myDate.getFullYear()}-${myDate.getMonth() + 1}-${myDate.getDate()}`]
    }
  },
  data() {
    return {
      range: [new Date(this.selectRange[0]), new Date(this.selectRange[1])],
      yearsModel: null,
      years: [],
      monthsModel: null,
      months: [],
      daysModel: null,
      days: [],
      currentScrollbar: null,
      visible: false,
      selectDate: "",
      oldValue: [],
      oldValueStr: ''
    };
  },
  watch: {
    visible(val) {
      this.adjustSpinners();
      const { yearsModel, monthsModel, daysModel } = this;
      if (val) {
        this.oldValue = [yearsModel, monthsModel, daysModel];
      }
    },
    value(val) {
      if (!val) {
        this.init();
      } else {
        this.oldValueStr = val;
        const dateArray = val.split("-");
        const { years, months, days, strAddZero } = this;
        const yearIndex = years.findIndex(item => item.value == dateArray[0]);
        const monthIndex = months.findIndex(item => item.value == dateArray[1]);
        const dayIndex = days.findIndex(item => item.value == dateArray[2]);
        this.yearsModel = Number(yearIndex);
        this.monthsModel = Number(monthIndex);
        this.daysModel = Number(dayIndex);
        this.oldValue = [yearIndex, monthIndex, dayIndex];
        this.selectDate = `${dateArray[0]}-${strAddZero(
          dateArray[1]
        )}-${strAddZero(dateArray[2])}`;
      }
    }
  },
  model: {
    prop: "value",
    event: "updateVal"
  },
  created() {
    this.init();
  },
  mounted() {
    this.$nextTick(() => {
      this.bindScrollEvent();
    });
  },
  methods: {
    init() {
      this.initSelectYear();
      this.initSelectMonth();
      this.initSelectDay();
      this.adjustSpinners();
    },
    initSelectYear() {
      let year = myDate.getFullYear(); //获取当前年
      this.years = [];
      for (let i = 0; i < year - beginYear; i++) {
        this.years.push({ value: year - i, label: year - i + "年", disabled: !this.isDateInRange('years', year - i) });
        if (i === 0) {
          this.yearsModel = i;
        }
      }
    },
    initSelectMonth(y, m) {
      const { months } = this;
      let month = !!m ? months[m].value : myDate.getMonth() + 1; //获取当前月
      this.months = [];
      for (let i = 1; i <= 12; i++) {
        this.months.push({ value: i, label: i + "月", disabled: !this.isDateInRange('months', i) });
        if (i === month && !m) {
          this.monthsModel = i - 1;
        }
      }
    },
    initSelectDay(y, m) {
      const { years, months } = this;
      let day = myDate.getDate(); //获取当前日
      let year = !!y ? years[y].value : myDate.getFullYear(); //获取当前年
      let month = !!m ? months[m].value : myDate.getMonth() + 1; //获取当前月
      let maxDay = this.getMaxDay(year, month);
      this.days = [];
      for (let i = 1; i <= maxDay; i++) {
        this.days.push({ value: i, label: i + "日", disabled: !this.isDateInRange('days', i) });
        if (i === day && !y && !m) {
          this.daysModel = i - 1;
        }
      }
      if (this.daysModel > maxDay - 1) {
        this.daysModel = maxDay - 1;
        this.adjustSpinner("days", maxDay - 1);
      }
    },
    getMaxDay(year, month) {
      var new_year = !!year ? year : myDate.getFullYear(); //取当前的年份
      var new_month = !!month ? month++ : myDate.getMonth() + 2; //取下一个月的第一天，方便计算（最后一天不固定）
      if (month > 12) {
        //如果当前大于12月，则年份转到下一年
        new_month -= 12; //月份减
        new_year++; //年份增
      }
      var new_date = new Date(new_year, new_month, 1); //取当年当月中的第一天
      return new Date(new_date.getTime() - 1000 * 60 * 60 * 24).getDate(); //获取当月最后一天日期
    },
    handleClick(type, value, disabled = false) {
      if (disabled) return;
      this.modifyDateField(type, value);
      this.emitSelectRange(type);
      this.adjustSpinner(type, value);
    },
    adjustSpinners() {
      this.adjustSpinner("years", this.yearsModel);
      this.adjustSpinner("months", this.monthsModel);
      this.adjustSpinner("days", this.daysModel);
    },
    adjustCurrentSpinner(type) {
      const _val =
        type === "years"
          ? this.yearsModel
          : type === "months"
          ? this.monthsModel
          : type === "days"
          ? this.daysModel
          : 0;
      this.adjustSpinner(type, _val);
    },
    adjustSpinner(type, value) {
      this.$nextTick(() => {
        const el = this.$refs[type].wrap;
        if (el) {
          el.scrollTop = Math.max(0, (value - 2.5) * 32 + 88);
        }
      });
    },
    modifyDateField(type, value) {
      const { years, months, days } = this;
      switch (type) {
        case "years":
          if (!years[value].disabled) {
            this.yearsModel = value;
            this.initSelectMonth(this.yearsModel, this.monthsModel);
            this.initSelectDay(this.yearsModel, this.monthsModel);
          };
          break;
        case "months":
          if (!months[value].disabled) {
            this.monthsModel = value;
            this.initSelectDay(this.yearsModel, this.monthsModel);
          }
          break;
        case "days":
          if (!days[value].disabled) {
            this.daysModel = value;
          }
          break;
      }
    },
    emitSelectRange(type) {
      this.currentScrollbar = type;
    },
    bindScrollEvent() {
      const bindFuntion = type => {
        this.$refs[type].wrap.onscroll = e => {
          // TODO: scroll is emitted when set scrollTop programatically
          // should find better solutions in the future!
          this.handleScroll(type, e);
        };
      };
      bindFuntion("years");
      bindFuntion("months");
      bindFuntion("days");
    },
    handleScroll(type, e) {
      const typeMax =
        type === "years"
          ? this.years.length - 1
          : type === "months"
          ? 11
          : this.days.length - 1;
      const value = Math.min(
        Math.floor(
          (this.$refs[type].wrap.scrollTop -
            (this.scrollBarHeight(type) * 0.5 - 10) /
              this.typeItemHeight(type) +
            3) /
            this.typeItemHeight(type)
        ),
        typeMax
      );
      this.modifyDateField(type, value);
    },
    typeItemHeight(type) {
      return this.$refs[type].$el.querySelector("li").offsetHeight;
    },
    scrollBarHeight(type) {
      return this.$refs[type].$el.offsetHeight;
    },
    handleCancel() {
      this.visible = false;
      const oldValue = JSON.parse(JSON.stringify(this.oldValue));
      this.yearsModel = oldValue[0];
      this.monthsModel = oldValue[1];
      this.daysModel = oldValue[2];
    },
    handleConfirm() {
      this.visible = false;
      const {
        yearsModel,
        years,
        monthsModel,
        months,
        daysModel,
        days,
        strAddZero
      } = this;
      this.selectDate = `${years[yearsModel].value}-${strAddZero(
        months[monthsModel].value
      )}-${strAddZero(days[daysModel].value)}`;
      this.$emit("updateVal", this.selectDate);
      this.$emit("change", this.selectDate);
    },
    validateDate(date) {
      return moment(date).isValid();
    },
    strAddZero(str) {
      if (String(str).length > 1) return str;
      const numStr = "123456789";
      if (numStr.indexOf(str) > -1) {
        return "0" + String(str);
      }
    },
    isDateInRange(type, date) {
      const { range, yearsModel, years, monthsModel, months } = this;
      let state = false;
      switch (type) {
        case 'years':
          state = date >= range[0].getFullYear() && date <= range[1].getFullYear();
          break;
        case 'months':
          let currentDateMonth = new Date(`${years[yearsModel].value}-${date}-1`);
          let minDate = new Date(`${range[0].getFullYear()}-${range[0].getMonth() + 1}-1`);
          let maxDate = new Date(`${range[1].getFullYear()}-${range[1].getMonth() + 1}-1`);
          state = currentDateMonth >= minDate && currentDateMonth <= maxDate;
          break;
        case 'days':
          let currentDateDay = new Date(`${years[yearsModel].value}-${months[monthsModel].value}-${date}`);
          state = currentDateDay >= range[0] && currentDateDay <= range[1];
          break;
        default:
          state = false;
          break;
      }
      return state;
    },
    popperHideHandler() {
      const { selectDate, oldValueStr } = this;
      if (selectDate === '') return;
      if (!this.validateDate(selectDate)) {
        this.selectDate = oldValueStr;
      }
    }
  }
};
</script>
<style scoped lang="scss">
.date-select-container {
  display: inline-block;
  width: 100%;
  position: relative;
  /deep/ .el-input__icon {
    transition: transform 0.2s linear;
    &.is-reverse {
      transform: rotate(180deg);
    }
  }
}

</style>
