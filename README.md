# tick
nextTick/setImmediate скоросная кросбраузерная реализация

## Использование
Если нет систем сборки схожих с `browserify`, то в глобальной области создаётся
метод `tick`, если же есть, то этот объект помещается в `exports`. Метод `tick`
не проверяет входные данные и не защищает очередь исполнения от ошибок внутри
очереди. Возвращает `true` если очередь не переполнилась

У объекта есть два метода и свойство:
* `getSafe()` возвращает безопасный метод `tick`, который проверяет,
что на вход подаётся функция, а так же, что очередь не переполнена.
Если всё хорошо, то возвращает `null`, иначе возвращает ошибку.
При переполнении очереди ошибка `RangeError` возвращается, но функция в очередь помещается.
Если передана не функция, то возвращается ошибка `TypeError`, не затрагивая очередь.
* `getSecure()` возвращает надёжный метод `tick`:
Если на вход подана не функция, то бросается исключение TypeError.
Если очередь переполняется, то функция добавляется, но возвращается ошибка RangeError.
Очередь обезопашена от поломок исполнемых функций. Если скорость не невероятно критична,
то *рекоммендуем* использовать эту версию.
* `mode` режим работы (можно менять, ни на что не влияет): 
** 'M' -- MutationObserver,
** 'P' -- Promise,
** 'S' -- postMessage,
** 'T' -- setTimeout
