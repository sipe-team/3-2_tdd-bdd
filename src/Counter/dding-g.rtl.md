# React Testing Library에 대해

Enzyme라고 들어보셨나요? Airbnb에서 개발한 react 테스트 라이브러리 라고 합니다.
![image](https://github.com/user-attachments/assets/451e3898-eee9-44ec-aecb-b6d85caa56c0)

RTL이 등장하고나서는 RTL의 사용량이 훨씬 많아졌는데, 왜 Enzyme보다 좋다고 판단했을까요?

```js
// enzyme 코드
import { mount } from "enzyme";
import Counter from "./Counter";

test("increments the counter", () => {
  const wrapper = mount(<Counter />);

  const incrementButton = wrapper.find("button").at(0); // or wrapper.find('[data-testid="my-button"]');
  incrementButton.simulate("click");

  expect(wrapper.text()).toContain("Count: 1");
});
```

```js
// RTL 코드
import { render, screen, fireEvent } from "@testing-library/react";
import Counter from "./Counter";

test("increments the counter", () => {
  render(<Counter />);

  const incrementButton = screen.getByText("Increment"); // or screen.getByTestId("my-button")
  fireEvent.click(incrementButton);

  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

dom 찾아가는거만 봐도 RTL이 훨씬 더 명시적입니다.

```js
import { shallow } from "enzyme";
import Counter from "./Counter";

it("increments the count state when increment button is clicked", () => {
  const wrapper = shallow(<Counter />);
  const instance = wrapper.instance();

  // Check initial state
  expect(wrapper.state("count")).toBe(0);

  // Simulate increment
  wrapper.find("button").simulate("click");

  // Check updated state
  expect(wrapper.state("count")).toBe(1);
});
```

enzyme와 RTL의 철학은 조금 다르게 느껴집니다.  
enzyme는 내부 구현에 좀 더 주시할 수 있도록 테스트를 작성합니다.  
하지만 이 경우에 내부 구현이 변경되면 테스트 코드도 같이 변경해야하기 때문에 리펙토링에 종속성이 생기게 됩니다.

```js
// 1. 클래스형 컴포넌트 -> 함수형 컴포넌트
// 2. state -> useReducer
function Counter() {
  const [state, dispatch] = React.useReducer(
    (state, action) => {
      switch (action.type) {
        case "increment":
          return { count: state.count + 1 };
        default:
          return state;
      }
    },
    { count: 0 }
  );

  return (
    <div>
      <span data-testid="count-value">{state.count}</span>
      <button
        data-testid="increment-button"
        onClick={() => dispatch({ type: "increment" })}
      >
        Increment
      </button>
    </div>
  );
}
```

이런식으로 내부 구현을 state에서 reducer로 변경한다면 테스트 코드의 `wrapper.state`는 더이상 사용할 수 없습니다.

이런 철학과 달리, RTL은 웹 페이지와 상호작용을 중심으로 테스트합니다.  
심지어 공식 문서에서도 구현의 세부사항을 테스트하지 말라고 권장합니다.([철학](https://testing-library.com/docs/#what-you-should-avoid-with-testing-library))

피해야할 4가지라고 안내하는 사항입니다.

1. 컴포넌트 내부 상태
2. 컴포넌트 내부 메서드
3. 컴포넌트 생명주기
4. 자식 컴포넌트

테스트를 작성하다보면 무의식적으로 내부 구현에 대한 세부사항을 검증받고 싶어 할 떄가 있습니다.  
RTL을 사용하면서는 사용자 입장에서 행위 중심의 테스트를 작성해 볼 필요가 있어보입니다. :)
