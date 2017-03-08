import { EventEmitter as Emitter } from '../core/Util'

type ChangeEventArgs<T> = {
  type: "added" | "changed" | "deleted",
  oldValue?: T,
  newValue?: T
};

describe("ObservableEvent", () => {
  let onChange:Emitter<ChangeEventArgs<string>>
  beforeEach(()=>{
    onChange = new Emitter<ChangeEventArgs<string>>();
  })
  describe("subscribe", () => {
    it("should register a listener", () => {
      onChange.subscribe((e) => { });
      expect(onChange.count).toEqual(1);
    })
    it("should allow for listeners to subscribe multiple times", () => {
      let subscriber = ()=>{};
      onChange.subscribe(subscriber);
      onChange.subscribe(subscriber);
      expect(onChange.count).toEqual(2);
    })
    it("should return a function to unsubscribe a listener", () => {
      let unsubscribe = onChange.subscribe((e) => { });
      expect(onChange.count).toEqual(1);
      unsubscribe();
      expect(onChange.count).toEqual(0);
    })
  })
  describe("unsubscribe", ()=>{
    it("should unsubscribe a listener", ()=>{
      let fn = jasmine.createSpy('subscriber');
      onChange.subscribe(fn);
      onChange.unsubscribe(fn);
      expect(onChange.count).toEqual(0);
      onChange.publish({type:"changed"});
      expect(fn).not.toHaveBeenCalled();
    })
  })
  describe("publish", ()=>{
    it("should call all subscribing listeners", ()=>{
      let subscriber = jasmine.createSpy('subscriber');
      onChange.subscribe(subscriber);
      let changeArgs:ChangeEventArgs<string> = {type:"added"};
      onChange.publish(changeArgs);
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(changeArgs);
    })
    it("should not call a subscriber after unsubscribing", ()=>{
      let subscriber = jasmine.createSpy('subscriber');
      let unsubscriber = onChange.subscribe(subscriber);
      let changeArgs:ChangeEventArgs<string> = {type:"added"};
      unsubscriber();
      onChange.publish(changeArgs);
      expect(subscriber).not.toHaveBeenCalled()
    })
  })
})