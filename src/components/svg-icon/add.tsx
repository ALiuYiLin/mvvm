import { defineComponent } from "@actview/core";

export const MyAddIcon = defineComponent({
  name: "MyAddIcon",
  render() {
    return (
      <svg
        class="btn-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    );
  },
});
