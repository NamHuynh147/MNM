import React, { useEffect, useMemo, useRef, useState } from "react";
import "../styles/CardDesigner.css";

// Import CKEditor với đầy đủ plugin
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";

// Cấu hình mở rộng
const ckEditorConfig = {
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "subscript",
      "superscript",
      "|",
      "alignment",
      "|",
      "bulletedList",
      "numberedList",
      "outdent",
      "indent",
      "|",
      "fontSize",
      "fontFamily",
      "fontColor",
      "fontBackgroundColor",
      "|",
      "link",
      "blockQuote",
      "insertTable",
      "mediaEmbed",
      "highlight",
      "horizontalLine",
      "pageBreak",
      "|",
      "undo",
      "redo",
      "|",
      "removeFormat",
      "sourceEditing",
    ],
  },
  placeholder: "Nhập nội dung thiệp...",
  fontSize: {
    options: [
      8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 40, 48, 56, 64, 72,
      96,
    ],
    supportAllValues: true,
  },
  fontFamily: {
    options: [
      "default",
      "Arial, Helvetica, sans-serif",
      "Courier New, Courier, monospace",
      "Georgia, serif",
      "Lucida Sans Unicode, Lucida Grande, sans-serif",
      "Tahoma, Geneva, sans-serif",
      "Times New Roman, Times, serif",
      "Trebuchet MS, Helvetica, sans-serif",
      "Verdana, Geneva, sans-serif",
      "Roboto, sans-serif",
      "Open Sans, sans-serif",
      "Montserrat, sans-serif",
      "Lobster, cursive",
      "Pacifico, cursive",
      "Dancing Script, cursive",
      "Great Vibes, cursive",
      "Playfair Display, serif",
    ],
    supportAllValues: true,
  },
  fontColor: {
    colors: [
      { color: "hsl(0, 0%, 0%)", label: "Đen" },
      { color: "hsl(0, 0%, 30%)", label: "Xám đậm" },
      { color: "hsl(0, 0%, 60%)", label: "Xám" },
      { color: "hsl(0, 0%, 90%)", label: "Xám nhạt" },
      { color: "hsl(0, 100%, 50%)", label: "Đỏ" },
      { color: "hsl(240, 100%, 50%)", label: "Xanh dương" },
      { color: "hsl(120, 100%, 25%)", label: "Xanh lá đậm" },
      { color: "hsl(120, 100%, 50%)", label: "Xanh lá" },
      { color: "hsl(60, 100%, 50%)", label: "Vàng" },
      { color: "hsl(30, 100%, 50%)", label: "Cam" },
      { color: "hsl(300, 100%, 25%)", label: "Tím đậm" },
      { color: "hsl(300, 100%, 50%)", label: "Tím" },
      { color: "hsl(180, 100%, 25%)", label: "Xanh ngọc đậm" },
      { color: "hsl(180, 100%, 50%)", label: "Xanh ngọc" },
      { color: "hsl(0, 0%, 100%)", label: "Trắng" },
    ],
    columns: 5,
  },
  fontBackgroundColor: {
    colors: [
      { color: "hsl(0, 0%, 100%)", label: "Trắng" },
      { color: "hsl(0, 0%, 90%)", label: "Xám nhạt" },
      { color: "hsl(0, 0%, 80%)", label: "Xám" },
      { color: "hsl(0, 100%, 95%)", label: "Đỏ nhạt" },
      { color: "hsl(60, 100%, 95%)", label: "Vàng nhạt" },
      { color: "hsl(120, 100%, 95%)", label: "Xanh lá nhạt" },
      { color: "hsl(240, 100%, 95%)", label: "Xanh dương nhạt" },
      { color: "hsl(300, 100%, 95%)", label: "Tím nhạt" },
    ],
    columns: 4,
  },
  heading: {
    options: [
      { model: "paragraph", title: "Đoạn văn", class: "ck-heading_paragraph" },
      {
        model: "heading1",
        view: "h1",
        title: "Tiêu đề 1",
        class: "ck-heading_heading1",
      },
      {
        model: "heading2",
        view: "h2",
        title: "Tiêu đề 2",
        class: "ck-heading_heading2",
      },
      {
        model: "heading3",
        view: "h3",
        title: "Tiêu đề 3",
        class: "ck-heading_heading3",
      },
      {
        model: "heading4",
        view: "h4",
        title: "Tiêu đề 4",
        class: "ck-heading_heading4",
      },
      {
        model: "heading5",
        view: "h5",
        title: "Tiêu đề 5",
        class: "ck-heading_heading5",
      },
      {
        model: "heading6",
        view: "h6",
        title: "Tiêu đề 6",
        class: "ck-heading_heading6",
      },
    ],
  },
  alignment: {
    options: ["left", "center", "right", "justify"],
  },
  table: {
    contentToolbar: [
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "tableProperties",
      "tableCellProperties",
    ],
  },
  highlight: {
    options: [
      {
        model: "yellowMarker",
        class: "ck-marker-yellow",
        title: "Bút vàng",
        color: "var(--ck-highlight-marker-yellow)",
        type: "marker",
      },
      {
        model: "greenMarker",
        class: "ck-marker-green",
        title: "Bút xanh",
        color: "var(--ck-highlight-marker-green)",
        type: "marker",
      },
      {
        model: "pinkMarker",
        class: "ck-marker-pink",
        title: "Bút hồng",
        color: "var(--ck-highlight-marker-pink)",
        type: "marker",
      },
      {
        model: "blueMarker",
        class: "ck-marker-blue",
        title: "Bút xanh dương",
        color: "var(--ck-highlight-marker-blue)",
        type: "marker",
      },
      {
        model: "redPen",
        class: "ck-pen-red",
        title: "Bút đỏ",
        color: "var(--ck-highlight-pen-red)",
        type: "pen",
      },
      {
        model: "greenPen",
        class: "ck-pen-green",
        title: "Bút xanh lá",
        color: "var(--ck-highlight-pen-green)",
        type: "pen",
      },
    ],
  },
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: "https://",
    decorators: {
      openInNewTab: {
        mode: "manual",
        label: "Mở trong tab mới",
        attributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      },
      downloadLink: {
        mode: "manual",
        label: "Tải file",
        attributes: {
          download: true,
        },
      },
    },
  },
  list: {
    properties: {
      styles: true,
      startIndex: true,
      reversed: true,
    },
  },
  image: {
    toolbar: [
      "imageTextAlternative",
      "imageStyle:inline",
      "imageStyle:block",
      "imageStyle:side",
      "imageStyle:alignLeft",
      "imageStyle:alignCenter",
      "imageStyle:alignRight",
    ],
    styles: ["full", "side", "alignLeft", "alignCenter", "alignRight"],
  },
  mediaEmbed: {
    previewsInData: true,
    providers: [
      {
        name: "youtube",
        url: /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/,
        html: (match) => {
          const url = `https://www.youtube.com/embed/${match[2]}`;
          return `<div style="position: relative; padding-bottom: 56.25%; height: 0;"><iframe src="${url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" frameborder="0" allowfullscreen></iframe></div>`;
        },
      },
    ],
  },
  removePlugins: ["Title", "MediaEmbedToolbar"],
  language: "vi",
  shouldNotGroupWhenFull: true,
  typing: {
    undoStep: 20,
  },
};
