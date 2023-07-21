import { OverlayTriggerState } from 'react-stately';

interface DescriptionProps {
  state: OverlayTriggerState;
}
const Description = (props: DescriptionProps) => {
  const state = props.state;
  return (
    <div className="p-40">
      <div className="pb-40 typography-32 text-brand font-bold text-center">bvh to VRMA</div>
      <div className="text-center typography-14 sm:typography-16 pb-8">
        あなたのbvhファイルをVRMAファイルに変換します。
      </div>
      <div className="text-center typography-14 sm:typography-16">
        サービスを利用する前に、
        <button
          className="text-link1"
          onClick={() => {
            state.open();
          }}
        >
          利用上の注意
        </button>
        をご確認ください。
      </div>
    </div>
  );
};
export default Description;
