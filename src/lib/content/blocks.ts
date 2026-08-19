/**
 * The six sections of the assessment, and the photograph that marks each one.
 *
 * Decided 16/08/2026. `assessment-motion.md` has the reasoning and
 * `two-registers.md` has the boundary against the mascot; the short version is
 * that the image marks a section rather than decorating a question, so it is
 * held for a whole block and changes six times across sixteen questions. Every
 * change means "new section", which is information.
 *
 * Blocks are read off the `SLOT:` annotations in `questions.ts`, not off the
 * order, so they group by what a question feeds rather than by where it happens
 * to sit.
 *
 * **`image: null` is the normal state until a photograph is sourced.** A block
 * with no image renders exactly as the assessment did before this existed. That
 * is deliberate: the sequence must not depend on art arriving.
 */

/** Question keys in order, grouped. `languages` is the grid, not a QuestionCard. */
export type Block = {
  id: string;
  /** Coach-facing. Never shown to a candidate. */
  title: string;
  keys: readonly string[];
  /**
   * File under `public/assess/blocks/`, or null while unsourced.
   *
   * Portrait or square, at least 1600x2000: the same file has to survive a
   * half-screen desktop panel and a short mobile banner crop.
   */
  image: string | null;
  /**
   * A twenty-pixel-wide JPEG of the same photograph, inline.
   *
   * Added 16/08/2026 because the panel sat empty for about a second while Next
   * resized the real file, which Paul saw as blank space. This is roughly 1.5kB
   * of base64 that ships with the page and paints instantly, so the panel is
   * never a hole: it goes blur to sharp, which is also a better arrival than a
   * fade from nothing.
   *
   * Regenerate with the sips one-liner in `public/assess/blocks/README.md` if a
   * photograph is ever swapped, or the blur will be of the old picture.
   */
  blurDataURL: string | null;
  /**
   * Where the subject actually is, as a CSS `object-position`. Omit for centred.
   *
   * Added 17/08/2026, after Paul saw a photograph with its subject cut in half.
   * The panel is a third of the screen and full height, so a landscape source is
   * cropped to about the middle 44% of its width, and a subject sitting off
   * centre in the frame falls outside that. The crop was already centred; the
   * photograph was not.
   *
   * **A property of the photograph, so it lives beside the photograph.** The
   * alternative was re-cropping the files, which throws away pixels that a wider
   * layout might want back and leaves nothing on record about why.
   */
  focus?: string;
  /**
   * What the picture is doing, in one line. Kept next to the slot rather than
   * only in the sourcing brief, because whoever swaps the file later will read
   * this and not that.
   */
  intent: string;
};

export const BLOCKS: readonly Block[] = [
  {
    id: "aim",
    title: "Where you are aiming",
    keys: ["pathway", "targetCountries", "targetRole"],
    image: "aim.jpg",
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAAA2gAwAEAAAAAQAAABQAAAAA/8IAEQgAFAANAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAMCBAEFAAYHCAkKC//EAMMQAAEDAwIEAwQGBAcGBAgGcwECAAMRBBIhBTETIhAGQVEyFGFxIweBIJFCFaFSM7EkYjAWwXLRQ5I0ggjhU0AlYxc18JNzolBEsoPxJlQ2ZJR0wmDShKMYcOInRTdls1V1pJXDhfLTRnaA40dWZrQJChkaKCkqODk6SElKV1hZWmdoaWp3eHl6hoeIiYqQlpeYmZqgpaanqKmqsLW2t7i5usDExcbHyMnK0NTV1tfY2drg5OXm5+jp6vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAQIAAwQFBgcICQoL/8QAwxEAAgIBAwMDAgMFAgUCBASHAQACEQMQEiEEIDFBEwUwIjJRFEAGMyNhQhVxUjSBUCSRoUOxFgdiNVPw0SVgwUThcvEXgmM2cCZFVJInotIICQoYGRooKSo3ODk6RkdISUpVVldYWVpkZWZnaGlqc3R1dnd4eXqAg4SFhoeIiYqQk5SVlpeYmZqgo6SlpqeoqaqwsrO0tba3uLm6wMLDxMXGx8jJytDT1NXW19jZ2uDi4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkJCQkJCRAJCRAWEBAQFh4WFhYWHiYeHh4eHiYuJiYmJiYmLi4uLi4uLi43Nzc3NzdBQUFBQUlJSUlJSUlJSUn/2wBDAQsMDBIREiARESBMMyozTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEz/2gAMAwEAAhEDEQAAAYLRAZQjFCn/2gAIAQEAAQUCAPLKasLKkmZYYlkSytRf/9oACAEDEQE/Aa0//9oACAECEQE/Ab0//9oACAEBAAY/AnoX7L00dAXq/wD/xAAzEAEAAwACAgICAgMBAQAAAgsBEQAhMUFRYXGBkaGxwfDREOHxIDBAUGBwgJCgsMDQ4P/aAAgBAQABPyFERhzmi5tp5J3U4+spnArsq//aAAwDAQACEQMRAAAQIH//xAAzEQEBAQADAAECBQUBAQABAQkBABEhMRBBUWEgcfCRgaGx0cHh8TBAUGBwgJCgsMDQ4P/aAAgBAxEBPxDx/9oACAECEQE/EPH/2gAIAQEAAT8QQQkhLn6r9DGMTzUEGzjx916sZnjC4heEH+rps/B/q//Z",
    intent: "A destination considered, not arrived at. Looking outward.",
  },
  {
    id: "bring",
    title: "What you bring",
    keys: ["experienceYears", "cv", "linkedin", "portfolio", "aiTools"],
    image: "bring.jpg",
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAABSgAwAEAAAAAQAAAA0AAAAA/8IAEQgADQAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAMCBAEFAAYHCAkKC//EAMMQAAEDAwIEAwQGBAcGBAgGcwECAAMRBBIhBTETIhAGQVEyFGFxIweBIJFCFaFSM7EkYjAWwXLRQ5I0ggjhU0AlYxc18JNzolBEsoPxJlQ2ZJR0wmDShKMYcOInRTdls1V1pJXDhfLTRnaA40dWZrQJChkaKCkqODk6SElKV1hZWmdoaWp3eHl6hoeIiYqQlpeYmZqgpaanqKmqsLW2t7i5usDExcbHyMnK0NTV1tfY2drg5OXm5+jp6vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAQIAAwQFBgcICQoL/8QAwxEAAgIBAwMDAgMFAgUCBASHAQACEQMQEiEEIDFBEwUwIjJRFEAGMyNhQhVxUjSBUCSRoUOxFgdiNVPw0SVgwUThcvEXgmM2cCZFVJInotIICQoYGRooKSo3ODk6RkdISUpVVldYWVpkZWZnaGlqc3R1dnd4eXqAg4SFhoeIiYqQk5SVlpeYmZqgo6SlpqeoqaqwsrO0tba3uLm6wMLDxMXGx8jJytDT1NXW19jZ2uDi4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkJCQkJCRAJCRAWEBAQFh4WFhYWHiYeHh4eHiYuJiYmJiYmLi4uLi4uLi43Nzc3NzdBQUFBQUlJSUlJSUlJSUn/2wBDAQsMDBIREiARESBMMyozTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEz/2gAMAwEAAhEDEQAAAatxUnpyltof/9oACAEBAAEFAhEqU+6EPkIYJfOkD5r/AP/aAAgBAxEBPwHT/9oACAECEQE/AdP/2gAIAQEABj8CAHo9S9T24vUP/8QAMxABAAMAAgICAgIDAQEAAAILAREAITFBUWFxgZGhscHw0RDh8SAwQFBgcICQoLDA0OD/2gAIAQEAAT8hhkyHPiov4Kya0Wl4B+V1xr5v/9oADAMBAAIRAxEAABBhn//EADMRAQEBAAMAAQIFBQEBAAEBCQEAESExEEFRYSBx8JGBobHRweHxMEBQYHCAkKCwwNDg/9oACAEDEQE/EDDvz//aAAgBAhEBPxB348//2gAIAQEAAT8QjjpKfyVVC5JD/dNADHcf7rokNjLUetfzcRLY8Jv/2Q==",
    intent: "Work already done. Hands, a desk, evidence of craft.",
  },
  {
    id: "go",
    title: "Whether you can go",
    keys: ["workAuth"],
    image: "go.jpg",
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAABSgAwAEAAAAAQAAAA0AAAAA/8IAEQgADQAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAMCBAEFAAYHCAkKC//EAMMQAAEDAwIEAwQGBAcGBAgGcwECAAMRBBIhBTETIhAGQVEyFGFxIweBIJFCFaFSM7EkYjAWwXLRQ5I0ggjhU0AlYxc18JNzolBEsoPxJlQ2ZJR0wmDShKMYcOInRTdls1V1pJXDhfLTRnaA40dWZrQJChkaKCkqODk6SElKV1hZWmdoaWp3eHl6hoeIiYqQlpeYmZqgpaanqKmqsLW2t7i5usDExcbHyMnK0NTV1tfY2drg5OXm5+jp6vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAQIAAwQFBgcICQoL/8QAwxEAAgIBAwMDAgMFAgUCBASHAQACEQMQEiEEIDFBEwUwIjJRFEAGMyNhQhVxUjSBUCSRoUOxFgdiNVPw0SVgwUThcvEXgmM2cCZFVJInotIICQoYGRooKSo3ODk6RkdISUpVVldYWVpkZWZnaGlqc3R1dnd4eXqAg4SFhoeIiYqQk5SVlpeYmZqgo6SlpqeoqaqwsrO0tba3uLm6wMLDxMXGx8jJytDT1NXW19jZ2uDi4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkJCQkJCRAJCRAWEBAQFh4WFhYWHiYeHh4eHiYuJiYmJiYmLi4uLi4uLi43Nzc3NzdBQUFBQUlJSUlJSUlJSUn/2wBDAQsMDBIREiARESBMMyozTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEz/2gAMAwEAAhEDEQAAAekYOKkadHCIZf/aAAgBAQABBQKRfKjgulSyOYZQ2UOKiX//2gAIAQMRAT8B0//aAAgBAhEBPwG9P//aAAgBAQAGPwIr9HgR5V7KD5lfh2//xAAzEAEAAwACAgICAgMBAQAAAgsBEQAhMUFRYXGBkaGxwfDREOHxIDBAUGBwgJCgsMDQ4P/aAAgBAQABPyEfAMsSxRCb1ZJZFzzEVJv/2gAMAwEAAhEDEQAAEPuv/8QAMxEBAQEAAwABAgUFAQEAAQEJAQARITEQQVFhIHHwkYGhsdHB4fEwQFBgcICQoLDA0OD/2gAIAQMRAT8QAzfP/9oACAECEQE/EO2ef//aAAgBAQABPxBrROB7eishcxEy6H91nCrO8GYmK7YxcTwzM0Vf/9k=",
    intent: "Paperwork and borders. The one block about a rule, not a person.",
  },
  {
    id: "understood",
    title: "How you will be understood",
    keys: ["english", "languages"],
    image: "understood.jpg",
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAABSgAwAEAAAAAQAAAA0AAAAA/8IAEQgADQAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAMCBAEFAAYHCAkKC//EAMMQAAEDAwIEAwQGBAcGBAgGcwECAAMRBBIhBTETIhAGQVEyFGFxIweBIJFCFaFSM7EkYjAWwXLRQ5I0ggjhU0AlYxc18JNzolBEsoPxJlQ2ZJR0wmDShKMYcOInRTdls1V1pJXDhfLTRnaA40dWZrQJChkaKCkqODk6SElKV1hZWmdoaWp3eHl6hoeIiYqQlpeYmZqgpaanqKmqsLW2t7i5usDExcbHyMnK0NTV1tfY2drg5OXm5+jp6vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAQIAAwQFBgcICQoL/8QAwxEAAgIBAwMDAgMFAgUCBASHAQACEQMQEiEEIDFBEwUwIjJRFEAGMyNhQhVxUjSBUCSRoUOxFgdiNVPw0SVgwUThcvEXgmM2cCZFVJInotIICQoYGRooKSo3ODk6RkdISUpVVldYWVpkZWZnaGlqc3R1dnd4eXqAg4SFhoeIiYqQk5SVlpeYmZqgo6SlpqeoqaqwsrO0tba3uLm6wMLDxMXGx8jJytDT1NXW19jZ2uDi4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkJCQkJCRAJCRAWEBAQFh4WFhYWHiYeHh4eHiYuJiYmJiYmLi4uLi4uLi43Nzc3NzdBQUFBQUlJSUlJSUlJSUn/2wBDAQsMDBIREiARESBMMyozTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEz/2gAMAwEAAhEDEQAAAQXnPxhp0qqt5N//2gAIAQEAAQUCjVg1LwAgU5ZRGuamMEipI//aAAgBAxEBPwER4tEA/wD/2gAIAQIRAT8B3Udqchf/2gAIAQEABj8CUoedA+QVdSvN+08UpfO8+LyL/8QAMxABAAMAAgICAgIDAQEAAAILAREAITFBUWFxgZGhscHw0RDh8SAwQFBgcICQoLDA0OD/2gAIAQEAAT8hBclh8tQRE0eFgbYYkO2A9uJ6igue/wD/2gAMAwEAAhEDEQAAEPwP/8QAMxEBAQEAAwABAgUFAQEAAQEJAQARITEQQVFhIHHwkYGhsdHB4fEwQFBgcICQoLDA0OD/2gAIAQMRAT8Q+e6kA7/S/9oACAECEQE/EHMjlhKJ/W//2gAIAQEAAT8QwOaTpFl9ZQ7IuUl5HdhKOUi7wvUHfighhKHmHOR4ixeK8imWjrT1WchKMdx3f//Z",
    intent: "Two people talking. Language as a bridge, not a test.",
  },
  {
    id: "now",
    title: "Where you are now",
    keys: ["stage", "applications", "applicationResponse", "timeline"],
    image: "now.jpg",
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAABSgAwAEAAAAAQAAAA0AAAAA/8IAEQgADQAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAMCBAEFAAYHCAkKC//EAMMQAAEDAwIEAwQGBAcGBAgGcwECAAMRBBIhBTETIhAGQVEyFGFxIweBIJFCFaFSM7EkYjAWwXLRQ5I0ggjhU0AlYxc18JNzolBEsoPxJlQ2ZJR0wmDShKMYcOInRTdls1V1pJXDhfLTRnaA40dWZrQJChkaKCkqODk6SElKV1hZWmdoaWp3eHl6hoeIiYqQlpeYmZqgpaanqKmqsLW2t7i5usDExcbHyMnK0NTV1tfY2drg5OXm5+jp6vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAQIAAwQFBgcICQoL/8QAwxEAAgIBAwMDAgMFAgUCBASHAQACEQMQEiEEIDFBEwUwIjJRFEAGMyNhQhVxUjSBUCSRoUOxFgdiNVPw0SVgwUThcvEXgmM2cCZFVJInotIICQoYGRooKSo3ODk6RkdISUpVVldYWVpkZWZnaGlqc3R1dnd4eXqAg4SFhoeIiYqQk5SVlpeYmZqgo6SlpqeoqaqwsrO0tba3uLm6wMLDxMXGx8jJytDT1NXW19jZ2uDi4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkJCQkJCRAJCRAWEBAQFh4WFhYWHiYeHh4eHiYuJiYmJiYmLi4uLi4uLi43Nzc3NzdBQUFBQUlJSUlJSUlJSUn/2wBDAQsMDBIREiARESBMMyozTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEz/2gAMAwEAAhEDEQAAAV11VHO9u4rCK3//2gAIAQEAAQUClkrPIsrcUZUnMsLUAlZp/9oACAEDEQE/ATkeH//aAAgBAhEBPwEY/VIL/9oACAEBAAY/AmXXsU10Pb//xAAzEAEAAwACAgICAgMBAQAAAgsBEQAhMUFRYXGBkaGxwfDREOHxIDBAUGBwgJCgsMDQ4P/aAAgBAQABPyEpjxTPAbK5WGjTsJSkL//aAAwDAQACEQMRAAAQtC//xAAzEQEBAQADAAECBQUBAQABAQkBABEhMRBBUWEgcfCRgaGx0cHh8TBAUGBwgJCgsMDQ4P/aAAgBAxEBPxDgwIcX/9oACAECEQE/EOXVrv/aAAgBAQABPxBJmAFnlO6BSsYzsokTKxMTFDCde+88VKwp5ScNbjC//9k=",
    intent: "The search itself. Screens, applications, waiting.",
  },
  {
    id: "cost",
    title: "What it costs",
    keys: ["family", "salary", "priorInvestment"],
    image: "cost.jpg",
    blurDataURL:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QCARXhpZgAATU0AKgAAAAgABAEaAAUAAAABAAAAPgEbAAUAAAABAAAARgEoAAMAAAABAAIAAIdpAAQAAAABAAAATgAAAAAAAABIAAAAAQAAAEgAAAABAAOgAQADAAAAAQABAACgAgAEAAAAAQAAABSgAwAEAAAAAQAAAA8AAAAA/8IAEQgADwAUAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAMCBAEFAAYHCAkKC//EAMMQAAEDAwIEAwQGBAcGBAgGcwECAAMRBBIhBTETIhAGQVEyFGFxIweBIJFCFaFSM7EkYjAWwXLRQ5I0ggjhU0AlYxc18JNzolBEsoPxJlQ2ZJR0wmDShKMYcOInRTdls1V1pJXDhfLTRnaA40dWZrQJChkaKCkqODk6SElKV1hZWmdoaWp3eHl6hoeIiYqQlpeYmZqgpaanqKmqsLW2t7i5usDExcbHyMnK0NTV1tfY2drg5OXm5+jp6vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAQIAAwQFBgcICQoL/8QAwxEAAgIBAwMDAgMFAgUCBASHAQACEQMQEiEEIDFBEwUwIjJRFEAGMyNhQhVxUjSBUCSRoUOxFgdiNVPw0SVgwUThcvEXgmM2cCZFVJInotIICQoYGRooKSo3ODk6RkdISUpVVldYWVpkZWZnaGlqc3R1dnd4eXqAg4SFhoeIiYqQk5SVlpeYmZqgo6SlpqeoqaqwsrO0tba3uLm6wMLDxMXGx8jJytDT1NXW19jZ2uDi4+Tl5ufo6ery8/T19vf4+fr/2wBDAAkJCQkJCRAJCRAWEBAQFh4WFhYWHiYeHh4eHiYuJiYmJiYmLi4uLi4uLi43Nzc3NzdBQUFBQUlJSUlJSUlJSUn/2wBDAQsMDBIREiARESBMMyozTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEz/2gAMAwEAAhEDEQAAAeoZIqTLQ3VD/9oACAEBAAEFAkyJykuEIBSCxmXMJiQtYH//2gAIAQMRAT8Baf/aAAgBAhEBPwFt/9oACAEBAAY/Ai1JPm6vyZFBR0L/AP/EADMQAQADAAICAgICAwEBAAACCwERACExQVFhcYGRobHB8NEQ4fEgMEBQYHCAkKCwwNDg/9oACAEBAAE/IQrux1Zou35ivQ7s5mH7qykd92IJmZf/2gAMAwEAAhEDEQAAEOPv/8QAMxEBAQEAAwABAgUFAQEAAQEJAQARITEQQVFhIHHwkYGhsdHB4fEwQFBgcICQoLDA0OD/2gAIAQMRAT8QC3f/2gAIAQIRAT8QsX//2gAIAQEAAT8QRUJrl4pKqEEPREPfd5yAkSl58YxPD8VIl8lA9m0YYmHSDjl5v//Z",
    // The two women sit in the right-hand third of a 2000px frame, centred on
    // roughly 67%. A centred crop kept the left one and cut the right one in
    // half, which is the frame Paul photographed.
    focus: "65% 50%",
    intent: "Money and family, the hardest block. Domestic and quiet.",
  },
] as const;

const BY_KEY = new Map<string, Block>(
  BLOCKS.flatMap((b) => b.keys.map((k) => [k, b] as [string, Block])),
);

/** The block a question belongs to, or undefined if it is in none. */
export function blockFor(questionKey: string): Block | undefined {
  return BY_KEY.get(questionKey);
}

/**
 * Every question key the blocks claim, for the verifier.
 *
 * A question added to `questions.ts` and not to a block would silently lose its
 * section marker, and the image would appear to jump backwards when the
 * candidate reached it. `verify-copy.ts` asserts the two agree.
 */
export const BLOCKED_KEYS: readonly string[] = BLOCKS.flatMap((b) => b.keys);
