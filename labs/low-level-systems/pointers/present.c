#include <stdio.h>

int main(void) {
    int x = 10;
    int *p = &x;

    printf("x  = %d\n", x);
    printf("*p = %d   (same value — p points at x)\n", *p);

    *p = 42;
    printf("after *p = 42, x = %d\n", x);

    return 0;
}
